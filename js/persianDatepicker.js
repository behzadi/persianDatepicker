/*!
 * persianDatepicker v0.1.0
 * http://github.com/behzadi/persianDatepicker/
 *
 * Copyright (c) 2013 Mohammad hasan Behzadi  All rights reserved.
 *
 * Released under the MIT license.
 *
 * jalali Date Functions
 *
 * Date: Tue Jan 1 2013
 * 
 * Last Update: Mon April 15 2019
 * 
 */
;
(function ($) {
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
        startDate: null,
        endDate: null,
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
        closeOnBlur: !0,
        calendarPosition: {
          x: 0,
          y: 0,
        },
        onShow: function () { },
        onHide: function () { },
        onSelect: function () { },
        onRender: function () { }
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
      self.selectMonthLiStyle = "style='height:" + (_ch * 7 + 7) / (4) + "px;line-height:" + (_ch * 7 + 7) / (4) + "px; width:" + (6.7 * _cw) / (3) + "px;width:" + (6.7 * _cw) / (3) + "px\\9;' ";
      self.selectYearLiStyle = "style='height:" + (_ch * 7 + 10) / (6) + "px;line-height:" + (_ch * 7 + 10) / (6) + "px; width:" + (6.7 * _cw - 14) / (3) + "px;width:" + (6.7 * _cw - 15) / (3) + "px\\9;' ";
      self.footerStyle = "style='height:" + _ch + "px;line-height:" + _ch + "px; font-size:" + _fontSize + "px;' ";

      self.jDateFunctions = new jDateFunctions();

      if (self.options.startDate != null) {
        if (self.options.startDate == "today")
          self.options.startDate = self.now().toString("YYYY/MM/DD");
        if (self.options.endDate == "today")
          self.options.endDate = self.now().toString("YYYY/MM/DD");
        self.options.selectedDate = self.options.startDate;
      }

      if (self.options.selectedDate == undefined && !self.options.showGregorianDate) {
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
      self.calendar = $('<div id="' + self._id + '" class="pdp-' + options.theme + '" />');

      if (self.options.startDate != null) {
        self.options.selectableYears = [];
        for (var i = self.persianDate.parse(self.options.startDate).year; i <= self.persianDate.parse(self.options.endDate).year; i++)
          self.options.selectableYears.push(i);
      }

      if (!(el.attr('pdp-id') || '').length) {
        el.attr('pdp-id', self._id);
      }

      el
        .addClass('pdp-el')
        .on('click', function (e) {
          self.show(e);
        })
        .on('focus', function (e) {
          self.show(e);
        });

      // close on blur
      if (options.closeOnBlur) {
        el.on('blur', function (e) {
          if (!self.calendar.is(":hover"))
            self.hide(e);
        });
      }

      if (options.selectedBefore) {
        if (self.options.selectedDate != undefined) {
          //>jd = self.jDateFunctions.getJulianDayFromPersian(self.persianDate.parse(self.options.selectedDate));
          self.showDate(el, self.persianDate.parse(self.options.selectedDate).toString("YYYY/MM/DD/" + self.jDateFunctions.getWeekday(self.persianDate.parse(self.options.selectedDate)), self.now().gDate, options.showGregorianDate));
        } else {
          //>jd = self.jDateFunctions.getJulianDayFromPersian(self.now());
          self.showDate(el, self.now().toString("YYYY/MM/DD/" + self.jDateFunctions.getWeekday(self.now())), self.now().gDate, options.showGregorianDate);
        }
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
        self.calendar.css({
          top: (elPos.top + el.outerHeight() + options.calendarPosition.y) + 'px',
          left: (elPos.left + options.calendarPosition.x) + 'px'
        });
      };
      self.onresize = onResize;
      $(window).resize(onResize);
      $('body').append(self.calendar);
      self.render();
      onResize();
    };

    // persianDatepicker methods
    persianDatepicker.prototype = {
      show: function () {
        this.calendar.show();
        $.each($('.pdp-el').not(this.el), function (i, o) {
          if (o.length) {
            o.options.onHide(o.calendar);
          }
        });
        this.options.onShow(this.calendar);
        this.onresize();
      },
      hide: function () {
        this.options.onHide(this.calendar);

        if (this.options && !this.options.alwaysShow) {
          this.calendar.hide();
        }

      },
      render: function () {
        this.calendar.children().remove();
        this.header();
        this.dows();
        this.content();
        this.footer();
        this.options.onRender();
      },
      header: function () {
        var self = this;
        _monthYear = $('<div class="" />');
        _monthYear.appendTo(this.calendar);
        _head = $('<div class="pdp-header" ' + self.headerStyle + ' />');
        _head.appendTo(this.calendar);
        _next = $('<div class="nextArrow" />')
          .html(this.options.nextArrow)
          .attr('title', 'ماه بعد');

        /*yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy*/
        if (self.options.endDate == null || (self.persianDate.parse(self.options.endDate).year > self.persianDate.year || self.persianDate.parse(self.options.endDate).month > self.persianDate.month)) {
          _next.bind("click", function () {
            nextMonth = self.persianDate.month + 1;
            for (; self.options.selectableMonths._indexOf(nextMonth) == -1 && nextMonth < 13; nextMonth++)
              ;
            self.persianDate.addMonth(nextMonth - self.persianDate.month);
            self.render();
          });
          _next.removeClass("disabled");
        } else {
          _next.addClass("disabled");
        }

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
            _yearSelect.css({
              display: 'none'
            });
            _monthSelect.css({
              display: 'inline-block'
            });
          });
        var _yearText = $('<span/>')
          .html(self.options.persianNumbers ? self.jDateFunctions.toPersianNums(self.persianDate.year) : self.persianDate.year)
          .mousedown(function () {
            return false;
          })
          .click(function (e) {
            e.stopPropagation();
            _monthSelect.css({
              display: 'none'
            });
            _yearSelect.css({
              display: 'inline-block'
            });
            _yearSelect.scrollTop(70);
          });

        //----
        _startDate = self.options.startDate != null ? self.persianDate.parse(self.options.startDate) : self.persianDate.parse("1/1/1");
        _endDate = self.options.endDate != null ? self.persianDate.parse(self.options.endDate) : self.persianDate.parse("9999/1/1");

        // selectable years
        var getSelectableYears = function (f, l) {
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
              if (_endDate.year == v || _endDate.year == 9999)
                self.persianDate.month = _endDate.month;
              if (_startDate.year == v || _startDate.year == 9999)
                self.persianDate.month = _startDate.month;
              self.render();
            });
            (pre) ? _yearSelect.prepend(o) : _yearSelect.append(o);
          });
        };
        getSelectableYears();

        // selectable months
        for (i = 1; i <= 12; i++) {
          var m = self.options.months[i - 1];
          var o = (self.options.selectableMonths._indexOf(i) == -1 || (_startDate.year == self.persianDate.year && _startDate.month > i) || (_endDate.year == self.persianDate.year && i > _endDate.month)) ? $('<li class="disableMonth" ' + self.selectMonthLiStyle + ' />').html(m) : $('<li ' + self.selectMonthLiStyle + ' />').html(m);
          if (i == self.persianDate.month) {
            o.addClass('selected');
          }
          o.data('month', {
            month: m,
            monthNum: i
          });
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
          .attr('title', 'ماه قبل');

        if (self.options.startDate == null || (self.persianDate.parse(self.options.startDate).year < self.persianDate.year || self.persianDate.parse(self.options.startDate).month < self.persianDate.month)) {
          _prev.bind("click", function () {
            //prevMonth = self.persianDate.month - 1;
            //for (; self.options.selectableMonths._indexOf(prevMonth) == -1 && prevMonth > 1; prevMonth--);
            //self.persianDate.addMonth(-(self.persianDate.month - prevMonth));
            self.persianDate.addMonth(-1);
            self.render();
          });
          _prev.removeClass("disabled");
        } else {
          _prev.addClass("disabled");
        }

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
        _start = self.jDateFunctions.getWeekday(self.persianDate);
        _end = self.jDateFunctions.getLastDayOfMonth(self.persianDate);
        for (var row = 0, cellIndex = 0; row < 5 + 1; row++) {
          _row = $('<div />');
          for (var col = 0; col < 7; col++ , cellIndex++) {
            if (cellIndex < _start || cellIndex - _start + 1 > _end) {
              _cell = $('<div class="nul cell " ' + self.cellStyle + ' />')
                .html('&nbsp;');
            } else {
              _dt = self.getDate(self.persianDate, cellIndex - _start + 1);
              _today = '', _selday = '', _disday = '';
              if (self.now().compare(_dt) == 0)
                _today = 'today';

              if (self.options.startDate != null && (self.persianDate.parse(self.options.startDate).compare(_dt) == -1 || self.persianDate.parse(self.options.endDate).compare(_dt) == 1))
                _disday = 'disday';

              if (self.options.selectedDate != undefined) {
                if (self.persianDate.parse(self.options.selectedDate).date == cellIndex - _start + 1)
                  _selday = 'selday';
              } else if (cellIndex - _start + 1 == self.now().date)
                _selday = 'selday';
              _fri = col == 6 ? 'friday' : '';
              _cell = $('<div class="day cell ' + _fri + ' ' + _today + ' ' + _selday + ' ' + _disday + '" ' + self.cellStyle + ' />');
              _cell.attr("data-jdate", _dt.toString("YYYY/MM/DD"));
              _cell.attr("data-gdate", self.jDateFunctions.getGDate(_dt)._toString("YYYY/MM/DD"));
              _cell.html(self.options.persianNumbers ? self.jDateFunctions.toPersianNums(cellIndex - _start + 1) : cellIndex - _start + 1);

              if (self.options.startDate == undefined || (self.persianDate.parse(self.options.startDate).compare(_dt) != -1 && self.persianDate.parse(self.options.endDate).compare(_dt) != 1))
                _cell.bind("click", function () {
                  self.calendar.find(".day").removeClass("selday");
                  $(this).addClass("selday");
                  if (self.options.showGregorianDate)
                    self.showDate(self.el, $(this).data('jdate'), $(this).data('gdate'), !0);
                  else
                    self.showDate(self.el, $(this).data('jdate'), $(this).data('gdate'), !1);

                  self.hide();
                });
            }
            _cell.appendTo(_row);
          }
          _row.appendTo(_days);
        }

      },
      footer: function () {
        var self = this;
        _footer = $('<div class="pdp-footer" ' + self.footerStyle + ' />');
        _footer.appendTo(this.calendar);

        if (self.options.selectableMonths._indexOf(self.persianDate.month) > -1) {
          _goToday = $('<a class="goToday" />');
          _goToday.attr("data-jdate", self.now().toString("YYYY/MM/DD/DW"));
          _goToday.attr("data-gdate", self.jDateFunctions.getGDate(self.now()));
          _goToday
            .attr("href", "javascript:;")
            .html('هم اکنون');
          if (self.options.startDate == null)
            _goToday.bind("click", function () {
              self.persianDate = self.now();

              self.showDate(self.el, $(this).data('jdate'), $(this).data('gdate'), self.options.showGregorianDate);

              self.calendar.find(".day").removeClass("selday");
              self.render();
              self.calendar.find(".today").addClass("selday");
              self.hide();
            });
          _goToday.appendTo(_footer);

        }

      },
      showDate: function (el, jDate, gDate, showGdate) {
        var self = this;
        jDate = self.persianDate.parse(jDate).toString(self.options.formatDate);
        gDate = new Date(gDate)._toString(self.options.formatDate);
        if (el.is('input:text')) {
          if (showGdate)
            el.val(gDate);
          else
            el.val(jDate);
        } else {
          if (showGdate)
            el.html(gDate);
          else
            el.html(jDate);
        }

        el.attr('data-jDate', jDate);
        el.attr('data-gDate', gDate);

        this.options.onSelect();
      },
      getDate: function (pd, d) {
        pd.date = d;
        pd.day = this.jDateFunctions.getWeekday(pd)
        return pd;
      },
      now: function () {
        return this.jDateFunctions.gregorian_to_jalali(new Date());
      },
    };
    // Return the persianDatepicker plugin
    return persianDatepicker;
  })();

  (function () {
    //padleft
    Number.prototype.padLeft = function (base, chr) {
      var len = (String(base || 10).length - String(this).length) + 1;
      return len > 0 ? new Array(len).join(chr || '0') + this : this;
    }

    // format Date with _toString()
    Date.prototype._toString = function (formatDate) {

      months = ["Januray", "February", "March", "April", "May", "June", "Julay", "August", "September", "October", "November", "December"];
      dows = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];
      if (formatDate === undefined || formatDate == "default")
        return this.toLocaleDateString();

      return (
        formatDate
          .replace("YYYY", this.getFullYear())
          .replace("MM", (this.getMonth() + 1))
          .replace("DD", this.getDate())
          .replace("0M", (this.getMonth() + 1) > 9 ? this.getMonth() + 1 : '0' + (this.getMonth() + 1))
          .replace("0D", this.getDate() > 9 ? this.getDate() : '0' + this.getDate())
          .replace("hh", this.getHours() == 0 ? new Date().getHours() : this.getHours())
          .replace("mm", this.getMinutes() == 0 ? new Date().getMinutes() : this.getMinutes())
          .replace("ss", this.getSeconds() == 0 ? new Date().getSeconds() : this.getSeconds())         
          .replace("0h", this.getHours() > 9 ? this.getHours() : "0" + this.getHours())
          .replace("0m", this.getMinutes() > 9 ? this.getMinutes() : "0" + this.getMinutes())
          .replace("0s", this.getSeconds() > 9 ? this.getSeconds() : "0" + this.getSeconds())         
          .replace("ms", this.getMilliseconds() == 0 ? new Date().getMilliseconds() : this.getMilliseconds())
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
})(jQuery); // end of persianDatepicker plugin

// persianDate object
var persianDate = (function () {
  function persianDate() {
    var self = this;
    self.months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    self.dowTitle = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"];
    self.year = 1300;
    self.month = 1;
    self.date = 1;
    self.day = 1;
    self.gDate = new Date();
  };
  persianDate.prototype = {
    now: function () {
      var jdf = new jDateFunctions();
      return jdf.gregorian_to_jalali(new Date());
    },
    addDay: function (d) {
      var jdf = new jDateFunctions();
      var to = d > 0 ? d : -d;
      for (var i = 0; i < to; i++) {
        var r = new persianDate();
        r.month = this.month;
        r.year = this.year;
        r = r.addMonth(-1);
        var lastDayOfMonth = d > 0 ? jdf.getLastDayOfMonth(this) : jdf.getLastDayOfMonth(r);
        d > 0 ? this.date += 1 : this.date -= 1;
        if (d > 0) {
          if (this.date > lastDayOfMonth) {
            this.date = 1;
            this.addMonth(1);
          }
        } else if (d < 0) {
          if (this.month > 1 && this.date > lastDayOfMonth) {
            this.date = 1;
            this.addMonth(1);
          } else if (this.date == 0) {
            this.addMonth(-1);
            this.date = lastDayOfMonth;
          }
        }

      }
      return this;
    },
    addMonth: function (d) {
      var to = d > 0 ? d : -d;
      for (var i = 0; i < to; i++) {
        d > 0 ? this.month += 1 : this.month -= 1;
        if (this.month == 13) {
          this.month = 1;
          this.addYear(1);
        } else if (this.month == 0) {
          this.month = 12;
          this.addYear(-1);
        }
      }
      return this;
    },
    addYear: function (d) {
      this.year += d;
      return this;
    },
    compare: function (d) {
      if (d.year == this.year && d.month == this.month && d.date == this.date)
        return 0;
      if (d.year > this.year)
        return 1;
      if (d.year == this.year && d.month > this.month)
        return 1;
      if (d.year == this.year && d.month == this.month && d.date > this.date)
        return 1;
      return -1;
    },
    parse: function (s) {
      arr = s.split("/");
      y = arr[0];
      m = arr[1];
      d = arr[2];
      var r = new persianDate();
      jdf = new jDateFunctions();
      r.year = parseInt(y), r.month = parseInt(m), r.date = parseInt(d), r.day = jdf.getWeekday(r), r.gDate = jdf.jalali_to_gregorian(r);
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
          .replace("0h", this.gDate.getHours() > 9 ? this.gDate.getHours() : "0" + this.gDate.getHours())
          .replace("0m", this.gDate.getMinutes() > 9 ? this.gDate.getMinutes() : "0" + this.gDate.getMinutes())
          .replace("0s", this.gDate.getSeconds() > 9 ? this.gDate.getSeconds() : "0" + this.gDate.getSeconds())         
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
  function jDateFunctions() { };

  jDateFunctions.prototype = {
    toPersianNums: function (s) {
      strnum = s.toString();
      nums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
      res = '';
      for (i = 0; i < strnum.length; i++)
        res += nums[parseInt(strnum[i])];
      return res;
    },

    gregorian_to_jalali: function (dt) {
      gy = dt.getFullYear();
      gm = dt.getMonth() + 1;
      gd = dt.getDate();
      g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      if (gy > 1600) {
        jy = 979;
        gy -= 1600;
      } else {
        jy = 0;
        gy -= 621;
      }
      gy2 = (gm > 2) ? (gy + 1) : gy;
      days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
      jy += 33 * (parseInt(days / 12053));
      days %= 12053;
      jy += 4 * (parseInt(days / 1461));
      days %= 1461;
      if (days > 365) {
        jy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
      }
      jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
      jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
      dt = new Date();
      pd = new persianDate();
      pd.year = jy;
      pd.month = jm;
      pd.date = jd;
      pd.gDate = dt;
      return pd;
    },

    jalali_to_gregorian: function (pd) {
      jy = pd.year;
      jm = pd.month;
      jd = pd.date;
      if (jy > 979) {
        gy = 1600;
        jy -= 979;
      } else {
        gy = 621;
      }
      days = (365 * jy) + ((parseInt(jy / 33)) * 8) + (parseInt(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
      gy += 400 * (parseInt(days / 146097));
      days %= 146097;
      if (days > 36524) {
        gy += 100 * (parseInt(--days / 36524));
        days %= 36524;
        if (days >= 365) days++;
      }
      gy += 4 * (parseInt(days / 1461));
      days %= 1461;
      if (days > 365) {
        gy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
      }
      gd = days + 1;
      sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (gm = 0; gm < 13; gm++) {
        v = sal_a[gm];
        if (gd <= v) break;
        gd -= v;
      }
      dt = new Date();
      return new Date(gy, gm - 1, gd, dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
    },
    getGDate: function (pd) {
      return this.jalali_to_gregorian(pd);
      //>return this.getGCalendarDate(this.getJulianDayFromPersian(pd), "gmonth");
    },
    getWeekday: function (pd) {
      var gds = [1, 2, 3, 4, 5, 6, 0];
      return gds[this.jalali_to_gregorian(pd).getDay()];
    },
    getLastDayOfMonth: function (pd) {
      y = pd.year, m = pd.month;
      if (m >= 1 && m <= 6) {
        return 31;
      } else if (m >= 7 && m < 12) {
        return 30;
      }
      /* Esfand */
      else if (this.isLeapYear(y)) {
        /* Leap year */
        return 30;
      }
      return 29;
    },
    // to 1472
    isLeapYear: function (year) {
      var ary = year > 1342 ? [1, 5, 9, 13, 17, 22, 26, 30] : [1, 5, 9, 13, 17, 21, 26, 30];
      b = year % 33;
      if (ary._indexOf(b))
        return true;
      return false;
    }
  }; //========

  return jDateFunctions;
})();
