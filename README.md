##[Demos and information](http://mbehzadi.com/persianDatepicker "mbehzadi.com")

##About

persianDatepicker is A lightweight jQuery plugin that select persian(jalali) date. 
  
- **Browsers:** >IE8, Chrome, Firefox, safari, opera  
- **Light weight:** ~14k minified
- **Beautiful themes:** default, dark
- **Size and font:** set the size (width & height) and fontsize for datepicker cells
- **Show persian numbers:** (۰ - ۹)
- **Select gregorian date:** (good way to convert jalali date to gregorian date)
- **Multi formatting date:** like ("YYYY/0M/DD hh:ss") becomes like **1392/07/22 16:45**
- **Selectable months and years:**  [1, 3, 4, 12]


##Usage
1- include jQuery & persianDatepicker.js & persianDatepicker.css
```html
<link type="text/css" rel="stylesheet" href="css/persianDatepicker.css" />
<script type="text/javascript" src="js/jquery-1.10.1.min.js"></script>
<script type="text/javascript" src="js/persianDatepicker.min.js"></script>
```
2- add your html element (input or span or etc)
```html
<input type="text" id="input1" />
<span id="span1"></span>
```
3- call the persianDatepicker plugin
```html
<script type="text/javascript">
    $(function() {
        $("#input1, #span1").persianDatepicker();       
    });
</script>
```


##Options
To customize persian datepicker, simply pass in an options object: (defaults shown)
```javascript
$("#input1")persianDatePicker({
    months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
    dowTitle: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"],
    shortDowTitle: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
    showGregorianDate: false,
    persianNumbers: true,
    formatDate: "YYYY/MM/DD",
    prevArrow: '\u25c4',
    nextArrow: '\u25ba',
    theme: 'default',
    alwaysShow: false,
    selectableYears: null,
    selectableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    cellWidth: 25, 
    cellHeight: 20, 
    fontSize: 13,             
    isRTL: false,
    calendarPosition: {
        x: 0,
        y: 0,
    },
    onShow: function(calendar) {
        calendar.show();
    },
    onHide: function(calendar) {
        calendar.hide();
    },
});
```

##Credit
Created by [@kharabati](http://twitter.com/kharabati "@kharabati"), [blog](http://mbehzadi.com/ "mbehzadi.com")

use, share , fork , enjoy! , ...
