/*!
 * persianDatepicker v0.1.0
 * http://github.com/behzadi/persianDatepicker/
 * http://mbehzadi.com/persianDatepicker/
 *
 * Copyright (c) 2013 Mohammad hasan Behzadi  All rights reserved.
 * 
 * Released under the MIT license.
 *
 * jalali Date Functions from NASA.gov 
 *
 * Date: Tue Jan 1 2013
 */
;
(function () {
    $.fn.persianDatepicker = function (options) {
        var pluginName = 'persianDatepicker';
        var instance = this.data(pluginName);
        if (!instance) {
            return this.each(function () {
                return $(this).data(pluginName, new persianDatepicker(this, options));
            });
        }
        return (options === true) ? instance : this;
    };
    // persianDatepicker object
    var persianDatepicker = (function () {
        function persianDatepicker(element, userOptions) {
            var defaults = {
                months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
                dowTitle: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"],
                shortDowTitle: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
                showGregorianDate: !1,
                persianNumbers: !0,
                formatDate: "YYYY/MM/DD",
                selectedBefore: !1,
                selectedDate: null,
                prevArrow: '\u25c4',
                nextArrow: '\u25ba',
                theme: 'default',
                alwaysShow: !1,
                selectableYears: null,
                selectableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                cellWidth: 25, // by px
                cellHeight: 20, // by px
                fontSize: 13, // by px                
                isRTL: !1,
                calendarPosition: {
                    x: 0,
                    y: 0,
                },
                onShow: function () { },
                onHide: function () { },
                onSelect: function () { }
            };
            var self = this;
            self.el = $(element);
            var el = self.el;
            self.options = $.extend(false, {}, defaults, userOptions);
            var options = self.options;

            _fontSize = options.fontSize;
            _cw = parseInt(options.cellWidth);
            _ch = parseInt(options.cellHeight);
            self.cellStyle = "style='width:" + _cw + "px;height:" + _ch + "px;line-height:" + _ch + "px; font-size:" + (_fontSize) + "px; ' ";
            self.headerStyle = "style='height:" + _ch + "px;line-height:" + _ch + "px; font-size:" + (_fontSize + 4) + "px;' ";
            self.selectUlStyle = "style='margin-top:" + _ch + "px;height:" + (_ch * 7 + 20) + "px; font-size:" + (_fontSize - 2) + "px;' ";
            self.selectMonthLiStyle = "style='height:" + (_ch * 7 + 7) / (4) + "px;line-height:" + (_ch * 7 + 7) / (4) + "px; width:" + (7 * _cw + 1) / (3) + "px;width:" + (7 * _cw) / (3) + "px\\9;' ";
            self.selectYearLiStyle = "style='height:" + (_ch * 7 + 10) / (6) + "px;line-height:" + (_ch * 7 + 10) / (6) + "px; width:" + (7 * _cw - 14) / (3) + "px;width:" + (7 * _cw - 15) / (3) + "px\\9;' ";
            self.footerStyle = "style='height:" + _ch + "px;line-height:" + _ch + "px; font-size:" + _fontSize + "px;' ";

            self.jDateFunctions = new jDateFunctions();

            if (self.options.selectedDate == undefined) {
                var patt1 = new RegExp('^([1-9][0-9][0-9][0-9])/([0]?[1-9]|[1][0-2])/([0]?[1-9]|[1-2][0-9]|[3][0-1])$');
                if (el.is('input')) {
                    if (patt1.test(el.val()))
                        self.options.selectedDate = el.val();                    
                } else {
                    if (patt1.test(el.html()))
                        self.options.selectedDate = el.html();
                }               
            }
            self._persianDate = (self.options.selectedDate != undefined) ? new persianDate().parse(self.options.selectedDate) : self.now();
            if (options.selectableYears != undefined && options.selectableYears._indexOf(self._persianDate.year) == -1)
                self._persianDate.year = options.selectableYears[0];
            if (self.options.selectableMonths._indexOf(self._persianDate.month) == -1)
                self._persianDate.month = options.selectableMonths[0];

            self.persianDate = self._persianDate;
            self._id = 'pdp-' + Math.round(Math.random() * 1e7);
            self.persianDate.formatDate = options.formatDate;
            self.calendar = $('<div id="' + self._id + '" class="pdp-' + options.theme + '" />')

            if (!(el.attr('pdp-id') || '').length) {
                el.attr('pdp-id', self._id);
            }

            el
                    .addClass('pdp-el')
                    .bind('click', function (e) {
                        self.show(e);
                    })
                    .bind('focus', function (e) {
                        self.show(e);
                    });

            if (options.selectedBefore && !options.showGregorianDate) {
                if (self.options.selectedDate != undefined)
                    self.showDate(el, self.persianDate.parse(self.options.selectedDate).toString(options.formatDate));
                else
                    self.showDate(el, self.now().toString(options.formatDate));
            }

            if (options.selectedBefore && options.showGregorianDate) {
                if (self.options.selectedDate != undefined)
                    self.showDate(el, self.persianDate.parse(self.options.selectedDate).gDate._toString(self.options.formatDate));
                else
                    self.showDate(el, self.now().gDate._toString(self.options.formatDate));
            }

            if (options.isRTL)
                el.addClass('rtl');
            if (self.calendar.length && !options.alwaysShow) {
                self.calendar.hide();
            }
            $(document).bind('mouseup', function (e) {
                var target = e.target;
                var calendar = self.calendar;
                if (!el.is(target) && !calendar.is(target) && calendar.has(target).length === 0 && calendar.is(':visible')) {
                    self.hide();
                }
                var container = $(".pdp-" + options.theme + " .yearSelect");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
                container = $(".pdp-" + options.theme + " .monthSelect");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
            });
            var onResize = function () {
                var elPos = el.offset();
                self.calendar.css(
                        {
                            top: (elPos.top + el.outerHeight() + options.calendarPosition.y) + 'px',
                            left: (elPos.left + options.calendarPosition.x) + 'px'
                        });
            };
            self.onresize = onResize;
            $(window).resize(onResize);            
            $('body').append(self.calendar);
            self.render();
            onResize();
        }
        ;
        // persianDatepicker methods
        persianDatepicker.prototype = {
            show: function () {
                this.calendar.show();
                //$.each($('.pdp-el').not(this.el), function(i, o) {
                //    if (o.length) {
                //        o.options.onHide(o.calendar);
                //    }
                //});
                this.options.onShow(this.calendar);
                this.onresize();
            },
            hide: function () {
                this.calendar.hide();
                //if (this.options && !this.options.alwaysShow) {
                //    this.options.onHide(this.calendar);
                //}
                this.options.onHide(this.calendar);
            },
            render: function () {
                this.calendar.children().remove();
                this.header();
                this.dows();
                this.content();
                this.footer();
            },
            header: function () {
                var self = this;
                _monthYear = $('<div class="" />');
                _monthYear.appendTo(this.calendar);
                _head = $('<div class="header" ' + self.headerStyle + ' />');
                _head.appendTo(this.calendar);
                _next = $('<div class="nextArrow" />')
                        .html(this.options.nextArrow)
                        .attr('title', 'ماه بعد')
                        .bind("click", function () {
                            nextMonth = self.persianDate.month + 1;
                            for (; self.options.selectableMonths._indexOf(nextMonth) == -1 && nextMonth < 13; nextMonth++);
                            self.persianDate.addMonth(nextMonth - self.persianDate.month);
                            self.render();
                        });
                _next.appendTo(_head);
                var _monthSelect = $('<ul class="monthSelect" ' + self.selectUlStyle + ' />').hide();
                var _yearSelect = $('<ul class="yearSelect" ' + self.selectUlStyle + ' />').hide();
                // Build month label
                var _monthText = $('<span/>')
                        .html(self.options.months[self.persianDate.month - 1])
                        .mousedown(function () {
                            return false;
                        })
                        .click(function (e) {
                            e.stopPropagation();
                            _yearSelect.css({ display: 'none' });
                            _monthSelect.css({ display: 'inline-block' });
                        });
                var _yearText = $('<span/>')
                        .html(self.options.persianNumbers ? self.jDateFunctions.toPersianNums(self.persianDate.year) : self.persianDate.year)
                        .mousedown(function () {
                            return false;
                        })
                        .click(function (e) {
                            e.stopPropagation();
                            _monthSelect.css({ display: 'none' });
                            _yearSelect.css({ display: 'inline-block' });
                            _yearSelect.scrollTop(70);
                        });
                var getSelectableYears = function (f, l) {
                    //_yearSelect.children().remove();
                    var pre = !1;
                    if (f === undefined && l === undefined) {
                        b = self.persianDate.year - 7;
                        a = self.persianDate.year + 14;
                    } else if (l == 0) {
                        b = f - 6;
                        a = f;
                        pre = !0;
                    } else if (f == 0) {
                        b = l + 1;
                        a = b + 6;
                    }
                    var arr = [];
                    for (i = b; i < a && b > 0; i++)
                        arr.push(parseInt(i));
                    $.each(self.options.selectableYears || ((pre) ? arr.reverse() : arr), function (i, v) {
                        var o = $('<li ' + self.selectYearLiStyle + ' />').html(self.options.persianNumbers ? self.jDateFunctions.toPersianNums(v) : v);
                        if (v == self.persianDate.year) {
                            o.addClass('selected');
                        }
                        o.attr("value", v);
                        o.bind("click", function () {
                            self.persianDate.date = 1;
                            self.persianDate.year = parseInt(v);
                            self.render();
                        });
                        (pre) ? _yearSelect.prepend(o) : _yearSelect.append(o);
                    });
                };
                getSelectableYears();

                // selectable months                
                for (i = 1; i <= 12; i++) {
                    var m = self.options.months[i - 1];
                    var o = (self.options.selectableMonths._indexOf(i) == -1) ? $('<li class="disableMonth" ' + self.selectMonthLiStyle + ' />').html(m) : $('<li ' + self.selectMonthLiStyle + ' />').html(m);
                    if (i == self.persianDate.month) {
                        o.addClass('selected');
                    }
                    o.data('month', { month: m, monthNum: i });
                    if (!o.hasClass('disableMonth')) {
                        o.bind("click", function () {
                            self.persianDate.date = 1;
                            self.persianDate.month = $(this).data('month').monthNum;
                            self.render();
                        });
                    }
                    _monthSelect.append(o);
                }

                // selectable years
                _yearSelect.bind("scroll", function () {
                    if (self.options.selectableYears == undefined) {
                        c = $(this).find("li").length;
                        firstYear = parseInt($(this).children("li:first").val());
                        lastYear = parseInt($(this).children("li:last").val());
                        lisHeight = c / 3 * ($(this).find("li:first").height() + 4);
                        _com = $(this).scrollTop().toString().length * 500;
                        if ($(this).scrollTop() < _com.toString().length * 100 && firstYear >= 1) {
                            getSelectableYears(firstYear, 0);
                        }

                        _com = $(this).scrollTop().toString().length * 100;
                        if ((lisHeight - $(this).scrollTop()) > -_com && (lisHeight - $(this).scrollTop()) < _com) {
                            getSelectableYears(0, lastYear);
                            $(this).scrollTop($(this).scrollTop() - 50);
                        }
                        if ($(this).scrollTop() < _com.toString().length && firstYear >= 30) {
                            $(this).scrollTop(_com.toString().length * 100);
                        }
                    }
                });
                _monthYear.append(_monthSelect).append(_yearSelect);
                var titleYearMonth = $('<div class="monthYear" />')
                        .append(_monthText)
                        .append("<span>&nbsp;&nbsp;</span>")
                        .append(_yearText);
                _head.append(titleYearMonth);
                _prev = $('<div class="prevArrow" />')
                        .html(this.options.prevArrow)
                        .attr('title', 'ماه قبل')
                        .bind("click", function () {
                            prevMonth = self.persianDate.month - 1;
                            for (; self.options.selectableMonths._indexOf(prevMonth) == -1 && prevMonth > 0; prevMonth--)
                                ;
                            self.persianDate.addMonth(-(self.persianDate.month - prevMonth));
                            self.render();
                        });
                _prev.appendTo(_head);
            },
            // days of week title
            dows: function () {
                _row = $('<div class="dows" />');
                for (i = 0; i < 7; i++) {
                    _cell = $('<div class="dow cell " ' + this.cellStyle + ' />')
                            .html(this.options.shortDowTitle[i]);
                    _cell.appendTo(_row);
                }
                _row.appendTo(this.calendar);
            },
            content: function () {
                var self = this;
                _days = $('<div class="days" />');
                _days.appendTo(this.calendar);
                jd = self.persianDate;
                jd.date = 1;
                _start = self.jDateFunctions.getWeekday(self.jDateFunctions.getJulianDayFromPersian(jd))
                _end = self.jDateFunctions.getLastDayOfPersianMonth(self.persianDate);
                for (var row = 0, cellIndex = 0; row < 5 + 1; row++) {
                    _row = $('<div />');
                    for (var col = 0; col < 7; col++, cellIndex++) {
                        if (cellIndex < _start || cellIndex - _start + 1 > _end) {
                            _cell = $('<div class="nul cell " ' + self.cellStyle + ' />')
                                    .html('&nbsp;');
                        } else {
                            _dt = self.getDate(self.persianDate, cellIndex - _start + 1);
                            _today = '', _selday = '';
                            if (self.now().compare(_dt) == 0)
                                _today = 'today';

                            if (self.options.selectedDate != undefined) {
                                if (self.persianDate.parse(self.options.selectedDate).date == cellIndex - _start + 1)
                                    _selday = 'selday';
                            } else if (cellIndex - _start + 1 == self.now().date)
                                _selday = 'selday';
                            _fri = col == 6 ? 'friday' : '';
                            _cell = $('<div class="day cell ' + _fri + ' ' + _today + ' ' + _selday + '" ' + self.cellStyle + ' />');
                            _cell.data("date", { jDate: _dt.toString("YYYY/MM/DD/DW"), gDate: self.jDateFunctions.getGDate(_dt)._toString(self.options.formatDate) });
                            _cell
                                    .html(self.options.persianNumbers ? self.jDateFunctions.toPersianNums(cellIndex - _start + 1) : cellIndex - _start + 1)
                                    .bind("click", function () {
                                        self.calendar.find(".day").removeClass("selday");
                                        $(this).addClass("selday");
                                        if (self.options.showGregorianDate)
                                            self.showDate(self.el, $(this).data('date').gDate);
                                        else
                                            self.showDate(self.el, $(this).data('date').jDate);
                                        self.calendar.hide();
                                    });
                        }
                        _cell.appendTo(_row);
                    }
                    _row.appendTo(_days);
                }

            },
            footer: function () {
                var self = this;
                _footer = $('<div class="footer" ' + self.footerStyle + ' />');
                _footer.appendTo(this.calendar);

                if (self.options.selectableMonths._indexOf(self.persianDate.month) > -1) {
                    _goToday = $('<a class="goToday" />');
                    _goToday.data("date", { jDate: self.now().toString("YYYY/MM/DD/DW"), gDate: self.jDateFunctions.getGDate(self.now())._toString(self.options.formatDate) });
                    _goToday
                            .attr("href", "javascript:;")
                            .html('هم اکنون')
                            .bind("click", function () {
                                self.persianDate = self.now();
                                if (self.options.showGregorianDate)
                                    self.showDate(self.el, $(this).data('date').gDate);
                                else
                                    self.showDate(self.el, $(this).data('date').jDate);
                                self.calendar.find(".day").removeClass("selday");
                                self.render();
                                self.calendar.find(".today").addClass("selday");
                                self.hide();
                            });
                    _goToday.appendTo(_footer);
                }
            },
            showDate: function (el, v) {
                var self = this;
                if (el.is('input')) {
                    el.val(self.persianDate.parse(v).toString(self.options.formatDate));
                } else {
                    el.html(self.persianDate.parse(v).toString(self.options.formatDate));
                }
                el.data('date', { jDate: v, gDate: this.jDateFunctions.getGDate(this.persianDate)._toString("YYYY/MM/DD/DW") });
                this.options.onSelect();
            },
            getDate: function (jd, d) {
                jd.date = d;
                jd.day = this.jDateFunctions.getWeekday(this.jDateFunctions.getJulianDayFromPersian(jd))
                return jd;
            },
            now: function () {
                return this.jDateFunctions.getPCalendarDate(this.jDateFunctions.getJulianDay(new Date()));
            },
        };
        // Return the persianDatepicker plugin
        return persianDatepicker;
    })();

    (function () {
        // format Date with _toString()
        Date.prototype._toString = function (formatDate) {
            months = ["Januray", "February", "March", "April", "May", "June", "Julay", "August", "September", "October", "November", "December"];
            dows = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];
            if (formatDate === undefined || formatDate == "default")
                return this;
            return (
                    formatDate
                    .replace("YYYY", this.getFullYear())
                    .replace("MM", this.getMonth() + 1)
                    .replace("DD", this.getDate())
                    .replace("0M", (this.getMonth() + 1) > 9 ? this.getMonth() + 1 : "0" + (this.getMonth() + 1).toString())
                    .replace("0D", this.getDate() > 9 ? this.getDate() : "0" + this.getDate().toString())
                    .replace("hh", this.getHours())
                    .replace("mm", this.getMinutes())
                    .replace("ss", this.getSeconds())
                    .replace("ms", this.getMilliseconds())
                    .replace("tm", (this.getHours() >= 12 && this.getMinutes() > 0) ? "PM" : "AM")
                    .replace("NM", months[this.getMonth()])
                    .replace("DW", this.getDay())
                    .replace("ND", dows[this.getDay()])
                    )
        };
        //    _indexOf() for arrays
        Array.prototype._indexOf = function (value) {
            return $.inArray(value, this);
        };
    })();
})();// end of persianDatepicker plugin

// persianDate object
var persianDate = (function () {
    function persianDate() {
        var self = this;
        self.months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
                self.dowTitle = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"],
                self.year = 1300;
        self.month = 1;
        self.date = 1;
        self.day = 1;
        self.gDate = new Date();
    }
    ;
    persianDate.prototype = {
        addMonth: function (d) {
            this.month += d;
            if (this.month >= 13) {
                this.month = 1;
                this.addYear(1);
            } else if (this.month <= 0) {
                this.month = 12;
                this.addYear(-1);
            }
            return this;
        },
        addYear: function (d) {
            this.year += d;
        },
        compare: function (d) {
            if (d.year == this.year && d.month == this.month && d.date == this.date)
                return 0;
        },
        parse: function (s) {
            arr = s.split("/");
            y = arr[0];
            m = arr[1];
            d = arr[2];
            wd = arr[3];
            var r = new persianDate();
            jdf = new jDateFunctions();
            r.year = parseInt(y), r.month = parseInt(m), r.date = parseInt(d)
                    , r.day = wd, r.gDate = jdf.getGCalendarDate(jdf.getJulianDayFromPersian(r), "jgmonth");
            return r;
        },
        toString: function (formatDate) {
            if (formatDate === undefined)
                return this.year + "/" + this.month + "/" + this.date;
            return (
                    formatDate
                    .replace("YYYY", this.year)
                    .replace("MM", this.month)
                    .replace("DD", this.date)
                    .replace("0M", this.month > 9 ? this.month : "0" + this.month.toString())
                    .replace("0D", this.date > 9 ? this.date : "0" + this.date.toString())
                    .replace("hh", this.gDate.getHours())
                    .replace("mm", this.gDate.getMinutes())
                    .replace("ss", this.gDate.getSeconds())
                    .replace("tm", (this.gDate.getHours() >= 12 && this.gDate.getMinutes() > 0) ? "ب.ظ" : "ق.ظ")
                    .replace("ms", this.gDate.getMilliseconds())
                    .replace("NM", this.months[this.month - 1])
                    .replace("DW", this.day)
                    .replace("ND", this.dowTitle[this.day])
                    )
        },
    };
    return persianDate;
})();

//  jalali Date Functions from NASA.gov 
var jDateFunctions = (function () {
    function jDateFunctions() {
    }
    ;

    jDateFunctions.prototype = {
        toPersianNums: function (s) {
            strnum = s.toString();
            nums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
            res = '';
            for (i = 0; i < strnum.length; i++)
                res += nums[parseInt(strnum[i])];
            return res;
        },
        getGDate: function (pd) {
            return this.getGCalendarDate(this.getJulianDayFromPersian(pd), "gmonth");
        },
        getPCalendarDate: function (jd) {
            var y = 0;
            var m = 0;
            var day = 0.0;
            if (jd > 0.0) {
                var jdm = jd + 0.5;
                var z = Math.floor(jdm);
                var f = jdm - z;
                var jdmp = Math.floor(jd) + 0.5;
                var pd = new persianDate();
                pd.year = 475;
                pd.month = 1;
                pd.date = 1;
                var depoch = jdmp - this.getJulianDayFromPersian(pd);
                var cycle = Math.floor(depoch / 1029983);
                var cyear = depoch % 1029983;
                var ycycle;
                if (cyear == 1029982) {
                    ycycle = 2820;
                }
                else {
                    var a1 = Math.floor(cyear / 366);
                    var a2 = cyear % 366;
                    ycycle = Math.floor(((2134 * a1) + (2816 * a2) + 2815) / 1028522) + a1 + 1;
                }
                y = ycycle + (2820 * cycle) + 474;
                if (y <= 0) {
                    y--;
                }
                pd.year = y;
                pd.month = 1;
                pd.date = 1;
                var yday = (jdmp - this.getJulianDayFromPersian(pd)) + 1;
                m = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
                pd.year = y;
                pd.month = m;
                pd.date = 1;
                day = (jdmp - this.getJulianDayFromPersian(pd)) + 1;
            }
            
            var r = new persianDate;
            r.year = y,
                    r.month = m,
                    r.date = day
                    , r.day = this.getWeekday(this.getJulianDayFromPersian(r)),
                    r.gDate = new Date();
            return r;
        },
        getGCalendarDate: function (jd, dateformat) {
            var y = 0;
            var m = 0;
            var day = 0.0;
            if (jd > 0.0) {
                var jdm = jd + 0.5;
                var z = Math.floor(jdm);
                var f = jdm - z;
                /* cases "jgmonth","gmonth","jmonth" */
                var a;
                if (dateformat == "jmonth" || (dateformat == "jgmonth" && z < 2299161)) {
                    a = z;
                }
                else if (dateformat == "gmonth" || (dateformat == "jgmonth" && z >= 2299161)) {
                    var alpha = Math.floor((z - 1867216.25) / 36524.25);
                    a = z + 1 + alpha - Math.floor(alpha / 4);
                }
                var b = a + 1524;
                var c = Math.floor((b - 122.1) / 365.25);
                var d = Math.floor(365.25 * c);
                var e = Math.floor((b - d) / 30.6001);
                day = b - d - Math.floor(30.6001 * e) + f;
                if (e < 14) {
                    m = e - 1;
                }
                else if (e == 14 || e == 15) {
                    m = e - 13;
                }
                if (m > 2) {
                    y = c - 4716;
                }
                else if (m == 1 || m == 2) {
                    y = c - 4715;
                }
            }
           
            r = new Date();
            return new Date(y, m - 1, day, r.getHours(), r.getMinutes(), r.getSeconds(), r.getMilliseconds());
        },
        /* function getJulianDay(originalY, originalM, originalD) */
        getJulianDay: function (d, jgGOrJ) {
            /* jgGOrJ: 0 = auto Julian/Gregorian; 1 = Gregorian; 2 = Julian */
            var jgGOrJ = (jgGOrJ === undefined) ? 0 : jgGOrJ;
            /* Given UT */
            var y0 = d.getFullYear();
            var m0 = d.getMonth() + 1;
            var d0 = d.getDate();
            var y = y0 + 0;
            var m = m0 + 0;
            var d = d0 + 0.0;
            /* y = -4712;
             m = 1;
             d = 1.5; */
            /* Determine JD */
            if (m <= 2) {
                y = y - 1;
                m = m + 12;
            }
            var b = 0;
            if (d0 < 1 || ((m0 == 1 || m0 == 3 || m0 == 5 || m0 == 7 || m0 == 8 || m0 == 10 || m0 == 12) && d0 > 31) || ((m0 == 4 || m0 == 6 || m0 == 9 || m0 == 11) && d0 > 30)) {
                //try {
                //    console.log("Id 646");
                //} catch (e) { }
            }
            if (jgGOrJ == 2 || (jgGOrJ == 0 && (y0 < 1582 || (y0 == 1582 && m0 < 10) || (y0 == 1582 && m0 == 10 && d0 <= 4)))) {
                /* Julian calendar */
                b = 0;
                if (y0 / 4.0 == Math.round(y0 / 4.0)) {
                    /* Leap year */
                    if (m0 == 2 && d0 > 29) {
                        //try {
                        //    console.log("Id 656");
                        //} catch (e) { }
                    }
                }
            }
            else if (jgGOrJ == 1 || (jgGOrJ == 0 && (y0 > 1582 || (y0 == 1582 && m0 > 10) || (y0 == 1582 && m0 == 10 && d0 >= 15)))) {
                /* Gregorian calendar */
                var a = Math.floor(y / 100);
                b = 2 - a + Math.floor(a / 4);
                if (y0 / 4.0 == Math.round(y0 / 4.0)) {
                    if (y0 / 100.0 == Math.round(y0 / 100.0)) {
                        if (y0 / 400.0 == Math.round(y0 / 400.0)) {
                            /* Leap year */
                            if (m0 == 2 && d0 > 29) {
                                //try {
                                //    console.log("Id 671");
                                //} catch (e) { }
                            }
                        }
                    }
                    else {
                        /* Leap year */
                        if (m0 == 2 && d0 > 29) {
                            //try {
                            //    console.log("Id 680");
                            //} catch (e) { }
                        }
                    }
                }
            }
            //else {
            //    try {
            //        console.log("Id 687");
            //    } catch (e) { }
            //}
            var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
            return jd;
        },
        getJulianDayFromPersian: function (pd) {
            y0 = pd.year, m0 = pd.month, d0 = pd.date;
            var epbase = y0 - ((y0 >= 0) ? 474 : 473);
            var epyear = 474 + (epbase % 2820);
            return d0 + ((m0 <= 7) ? ((m0 - 1) * 31) : (((m0 - 1) * 30) + 6)) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (1948320.5 - 1);
        },
        getWeekday: function (jd) {
            wds = [1, 2, 3, 4, 5, 6, 0];
            wd = Math.floor((jd + 1.5) % 7.0);
            return wds[wd];
        },
        getLastDayOfPersianMonth: function (pd) {
            y = pd.year, m = pd.month;
            if (m >= 1 && m <= 6) {
                return 31;
            }
            else if (m >= 7 && m < 12) {
                return 30;
            }
            else if (m != 12) {
                //try {
                //    console.log("Id 715");
                //}catch (e){}
            }
            /* Esfand */
            if (((((((y - ((y > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682) {
                /* Leap year */
                return 30;
            }
            return 29;
        },
    }; //========

    return jDateFunctions;
})();
