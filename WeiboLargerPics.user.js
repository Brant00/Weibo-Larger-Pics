// ==UserScript==
// @name           新浪微博之我要看大图 Weibo Larger Pics
// @namespace      http://xiaoxia.de/
// @description    新浪微博看图增强脚本：画廊模式：轻松查看本页所有大图；缩略图增加浮动工具栏、图片框增加按钮：快速进入大图页面、图片详情页面和原始地址。
// @license        GNU Lesser General Public License (LGPL)
// @version        1.2.1.3
// @author         xiaoxia
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_addStyle
// @include        http://t.sina.com.cn/*
// @include        http://weibo.com/*
// @include        http://www.weibo.com/*
// @include        http://e.weibo.com/*
// @include        http://gov.weibo.com/*
// @include        http://media.weibo.com/*
// @include        http://s.weibo.com/*
// @include        http://hot.weibo.com/*
// @include        http://huati.weibo.com/*
// @exclude        http://s.weibo.com/user/*
// @exclude        http://s.weibo.com/pic/*
// @exclude        http://weibo.com/app/*
// @exclude        http://weibo.com/app
// @updateURL      https://userscripts.org/scripts/source/173273.meta.js
// @downloadURL    https://userscripts.org/scripts/source/173273.user.js
// @updateinfo     修正几个影响看图体验的错误
// ==/UserScript==


/* -getId- */
var $id = function(id) {
    return document.getElementById(id);
};

/* -监听动画方法- */
/** http://g.mozest.com/thread-42401-1-1 **/
function addStyleCompatible(a){var b,d,c;'undefined'!=typeof GM_addStyle?'undefined'==typeof GM_updatingEnabled||0!==document.getElementsByTagName('head').length?GM_addStyle(a):b=window.setInterval(function(){0!==document.getElementsByTagName('head').length&&(window.clearInterval(b),GM_addStyle(a))},3):'undefined'!=typeof addStyle?addStyle(a):(c=document.querySelector('head'),c&&(d=document.createElement('style'),d.type='text/css',d.innerHTML=a,c.appendChild(d)))}function addNodeInsertedListener(a,b,c,d){var i,j,k,e='anilanim',f=['-o-','-moz-','-webkit-',''],g=['animationstart','webkitAnimationStart','oAnimationStart'],h=function(a,b){for(var c=0,d=a.length;d>c;c++)b(a[c])};return d||(i=a+'{',j='',h(f,function(a){i+=a+'animation-duration:.001s;'+a+'animation-name:'+e+';',j+='@'+a+'keyframes '+e+'{from{opacity:1;}to{opacity:1;}}'}),i+='}'+j,addStyleCompatible(i)),b?(k=function(d){var e=document.querySelectorAll(a),f=d.target;0!==e.length&&h(e,function(a){return f===a?(c&&removeNodeInsertedListener(k),b.call(f,d),void 0):void 0})},h(g,function(a){document.addEventListener(a,k,!1)}),k):void 0}function removeNodeInsertedListener(a){var b=['animationstart','webkitAnimationStart','oAnimationStart'],c=function(a,b){for(var c=0,d=a.length;d>c;c++)b(a[c])};c(b,function(b){document.removeEventListener(b,a,!1)})}

/* -判断图像大小- */
/**
 * 图片头数据加载就绪事件 - 更快获取图片尺寸
 * @version 2011.05.27
 * @author  TangBin
 * @see     http://www.planeart.cn/?p=1121
 */
var imgReady=function(){var e=[],t=null,n=function(){var t=0;for(;t<e.length;t++)e[t].end?e.splice(t--,1):e[t]();!e.length&&r()},r=function(){clearInterval(t),t=null};return function(r,i,s,o){var u,a,f,l,c,h=new Image;h.src=r;if(h.complete){i.call(h),s&&s.call(h);return}a=h.width,f=h.height,h.onerror=function(){o&&o.call(h),u.end=!0,h=h.onload=h.onerror=null},u=function(){l=h.width,c=h.height;if(l!==a||c!==f||l*c>1024)i.call(h),u.end=!0},u(),h.onload=function(){!u.end&&u(),s&&s.call(h),h=h.onload=h.onerror=null},u.end||(e.push(u),t===null&&(t=setInterval(n,40)))}}();


/* -全局变量和常量- */

//加入需要的 CSS
addStyleCompatible('/* 选项 */.wlp_btn_grey a{color:#999 !important}/* 画廊 */#wlp_img_wrap{-moz-user-select:none;-webkit-user-select:none;user-select: none;position:fixed;width:100%;height:100%;left:0;top:0;z-index:9999;background:rgba(0,0,0,.95);opacity:0;visibility:hidden;transition:opacity .5s ease-out 0s;}#wlp_img_drag{position:absolute;z-index:100;}#wlp_img{transition:opacity .2s ease-out 0s;opacity:0}#wlp_img_controler{opacity:.4;transition:opacity .3s ease-out 0s;position:fixed;bottom:0;left:0;width:100%;background:rgba(255,255,255,.7);text-align:center;z-index:100}#wlp_img_controler:hover{opacity:1 !important;}#wlp_img_controler a{color:#333;padding:5px 10px;border:1px solid #CCC;border-radius:3px;background:#FFF;margin:10px 20px;display:inline-block;line-height:1}#wlp_img_controler a:hover{text-decoration:none;background:#2AF;color:#FFF;cursor:pointer}#wlp_img_ratio{width:2em}#wlp_img_exit{position:absolute;right:0;line-height:1}#wlp_img_help{position:absolute;left:0;line-height:1}#wlp_img_noti{position:absolute;left:48%;top:50%;color:#FFF}/* 浮动栏 */#wlp_floatbar{background:#FFF;border:1px solid #CCC;border-radius:3px;width:28px;overflow:hidden;position:absolute;padding:8px 2px;text-align:center;line-height:1.9;z-index:9998;opacity:0;transition:opacity 0.1s ease-out 0s}#wlp_floatbar:hover{border-color:#3BF}#wlp_floatbar a{display:block}.wlp_floatbar_hide{display:none !important}');

//基本变量
var uid, pid, mid, format, para, cdn, multiPics, quote, t, ft, ht, it, imgNum = 0, imgs = [];
//版面判断。公益版使用 iframe，无法支持。
var enterprise = window.location.host === 'e.weibo.com', //判断企业版、专业版、ZF 版微博
    media = window.location.host === 'media.weibo.com', //判断媒体版微博
    search = window.location.host === 's.weibo.com', //判断搜索页面
    hot = window.location.host === 'hot.weibo.com', //判断热门页面
    huati = window.location.host === 'huati.weibo.com', //判断话题页面
    gov = window.location.host === 'gov.weibo.com'; //判断 ZF 页面，但是似乎所有 ZF 版都是用 e.weibo.com 
//正则表达式
var reg1 = /.*\/pid\/(.*)\?.*/,
    reg2 = /.*\/mid\/(.*?)\/.*/,
    reg3 = /.*weibo.com\/(.*?)\/.*/,
    reg4 = /.*uid=(\d*)&?.*/,
    reg5 = /.*mid=(\d*)&?.*/,
    reg6 = /^.*?\/\/ww(.).*/,
    reg7 = /.*(\....)$/,
    reg8 = /.*large\/([\w]+)\..../,
    reg9 = /.*pid=(\w*)&?.*/,
    reg10 = /.*rootuid=(\d*)&?.*/,
    reg11 = /[upm]id=/g,
    reg12 = /.*rootmid=(\d*)&?.*/,
    reg13 = /.*[(square)|(thumbnail)]\/(.*)\..../,
    reg14 = /(thumbnail)|(square)/,
    reg15 = /.*scale\((.*?)\).*/,
    reg16 = /.*rotate\((.*?)deg\).*/;
//小图绑定记录
var wlp_bind = {};
//浮动栏对象
var wlp_floatbar = {};

//判断浏览器以确定储存方法
var _type, _on, _mode, _css;
typeof(document.body.style.transform) === 'undefined' ? _css = false : _css = true; //判断浏览器是否支持标准 css 属性
var GM_getValue;
if(typeof(GM_getValue) !== 'undefined'){
    //Firefox 和 Chrome + Tampermonkey 和其它使用 GM 的浏览器使用 GM 方法储存
    _on = GM_getValue('floatbar', true);
    _mode = GM_getValue('mode', true);
    _type = 1;
}else if(typeof(window.chrome) !== 'undefined'){
    //Chrome 使用 localstorage 储存
    _on = localStorage['floatbar'] === 'true' || typeof(localStorage['floatbar']) === 'undefined';
    _mode = localStorage['mode'] === 'true' || typeof(localStorage['mode']) === 'undefined';
    _type = 2;
}else if(typeof(window.external.mxGetRuntime) !== 'undefined'){
    //Maxthon 插件版使用原生接口储存
    var pb = window.external.mxGetRuntime();
    _on = window.pb.storage.getConfig('floatbar');
    _on = (_on === '' || _on === 'true');
    _mode = window.pb.storage.getConfig('mode');
    _mode = (_mode === '' || _mode === 'true');
    _type = 3;
}else{
    //以上都不支持的浏览器常开
    _on = true;
    _mode = true;
}

/* -大图- */

//大图插入按钮
var insertEls = function(node, uid, mid, pid, format, cdn, multiPics){

    //插入 a 标签
    var insertA = function(node, href, title, inner){
        var aElement = document.createElement('a');
        aElement.href = href;
        aElement.target = '_blank';
        aElement.innerHTML = inner;
        aElement.title = title;
        node.appendChild(aElement);
    };

    //插入 i 标签
    var insertI = function(node, symbol){
        var iElement = document.createElement('i');
        iElement.className = 'W_vline W8_vline wlp_el MIB_line_l';
        iElement.innerHTML = symbol;
        node.appendChild(iElement);
    };

    //大图地址
    insertI(node,'<');
    insertA(node, 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid, '进入相册大图页面', '图');

    //相册详情，多图模式下无法获得 mid，所以不显示
    if(!multiPics){
        insertI(node, '|');
        insertA(node, 'http://photo.weibo.com/' + uid + '/talbum/detail/photo_id/' + mid, '进入相册详情页面，这里可以看到图片的全部评论', '详');
    }

    //原图地址
    insertI(node, '|');
    insertA(node, 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format, '大图原始地址，在此点右键可以另存图像或者复制地址转发给别人', '源');

    //画廊
    insertI(node, '|');
    var aElement = document.createElement('a');
    aElement.innerHTML = '览';
    aElement.title = '使用画廊模式浏览本页大图';
    aElement.href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
    aElement.onclick = function(){
        imgs = document.querySelectorAll('img.bigcursor, img.imgicon');
        src = this.href;
        for(var i in imgs){
            //获取当前图片的次序
            if(imgs[i].src.replace(reg14, 'large') === src){
                imgNum = i;
                break;
            }
        }
        _mode === true ? true : src = this.href.replace('large', 'bmiddle');
        imgReady(src, function(){calcPos(this.height, this.width, src)});
        imgDiv.style.visibility = 'visible';
        imgDiv.style.opacity = '1';
        noti.innerHTML = '正在读取...';
        bindDocument();
        return false;
    }
    node.appendChild(aElement);
    insertI(node, '>');
};

//绑定大图
var bindLarge = {

    main : function(){
        addNodeInsertedListener('div.smallcursor img, div.pic_show_box img', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.main(e.target || event.target);
        });
    },

    media : function(){
        addNodeInsertedListener('img.imgSmall', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.media(e.target || event.target);
        });
    },

    enterprise : function(){
        addNodeInsertedListener('div.smallcursor img', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.enterprise(e.target || event.target);
        });
    },

    hot : function(){
        addNodeInsertedListener('div.smallcursor img, div.pic_show_box img', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.hot(e.target || event.target);
        });
    },

    search : function(){
        addNodeInsertedListener('div.smallcursor img, div.pic_show_box img', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.search(e.target || event.target);
        });
    },

    huati : function(){
        addNodeInsertedListener('.media_big img.smallcursor, div.pic_show_box img', function(e) {
            if(wlp_floatbar.on){wlp_floatbar.close();}
            entryLarge.huati(e.target || event.target);
        });
    }
};

//监测到出现大图后的行为
var entryLarge = {

    main : function(that){

        if(that.parentNode.className.indexOf('smallcursor') >= 0){
            that = that.parentNode.parentNode;
            multiPics = false;
        }else{
            that = that.parentNode.parentNode.parentNode.parentNode.parentNode;
            multiPics = true;
        }

        format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');//图片格式
        cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');//图片 CDN 地址
        para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(reg11, '').split('&');
        pid = para[0];
        mid = para[1];
        uid = para[2];

        if(that.children[0].getElementsByClassName('wlp_el').length === 0){
            insertEls(that.children[0], uid, mid, pid, format, cdn, multiPics);
        }else if(that.className.indexOf('expand') === -1){
            format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
            cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
            para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(reg11, '').split('&');
            pid = para[0];
            mid = para[1];
            uid = para[2];
            that.children[0].children[8].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
            that.children[0].children[10].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
            that.children[0].children[12].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
        }
    },

    media : function(that){

        that = that.parentNode.parentNode;
        if(that.parentNode.className === 'MIB_assign'){
            that = that.parentNode.parentNode;
            mid = that.id.replace('disp_', '');
            uid = that.parentNode.children[3].children[0].children[0].children[0].href.replace(reg3, '$1');
            that = that.children[0].children[1].children[0];
        }else if(that.className.indexOf('blogPicOri') >=0 ){
            mid = that.id.replace('disp_', '');
            uid = that.parentNode.children[0].getElementsByClassName('source_att')[0].children[0].href.replace(reg3, '$1');
            var rid = that.parentNode.children[0].getElementsByClassName('source_att')[0].children[0].children[1].getAttribute('rid'); //怎么特么又跑出来个 rid
            mid = rid;
            that = that.children[1];
        }

        format = that.children[1].src.replace(reg7, '$1');
        cdn = that.children[1].src.replace(reg6, '$1');
        pid = that.children[1].src.replace(/.*\/([\w]+)\..../, '$1');

        if(that.children[0].getElementsByClassName('wlp_el').length === 0){
            insertEls(that.children[0], uid, mid, pid, format, cdn, false);
        }
    },

    enterprise : function(that){

        that = that.parentNode.parentNode;

        quote = (that.className === 'expand' && that.getAttribute('node-type') === 'feed_list_media_disp'); //是否为引用图
        multiPics = false; //判断是否为多图模式，企业版不支持发布多图
        format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
        cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
        para = that.parentNode.parentNode.querySelector('p.info').children[0].children[0].getAttribute('action-data');
        if(!quote){
            uid = para.replace(reg4, '$1');
            mid = para.replace(reg5, '$1');
        }else{
            uid = para.replace(reg10, '$1');
            mid = para.replace(reg12, '$1');
        }
        pid = para.replace(reg9, '$1');

        if(that.children[0].getElementsByClassName('wlp_el').length === 0){
            insertEls(that.children[0], uid, mid, pid, format, cdn, multiPics);
        }
    },

    hot : function(that){

        if(that.parentNode.className === 'smallcursor'){
            that = that.parentNode.parentNode;
            multiPics = false;
        }else{
            that = that.parentNode.parentNode.parentNode.parentNode.parentNode;
            multiPics = true;
        }

        quote = (that.className === 'expand' && that.getAttribute('node-type') === 'feed_list_media_disp');
        format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
        cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
        if(!quote && !multiPics){
            para = that.parentNode.children[4].getElementsByClassName('WB_handle')[0].children[0].getAttribute('action-data');
            uid = para.replace(reg4, '$1');
            mid = para.replace(reg5, '$1');
            pid = para.replace(reg9, '$1');
        }else{
            para = that.getElementsByClassName('show_big')[0].href;
            pid = para.replace(reg1, '$1');
            mid = para.replace(reg2, '$1');
            uid = para.replace(reg3, '$1');
        }

        if(that.children[0].getElementsByClassName('wlp_el').length === 0){
            insertEls(that.children[0], uid, mid, pid, format, cdn, multiPics);
        }else{
            format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
            cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
            para = that.getElementsByClassName('show_big')[0].href;
            pid = para.replace(reg1, '$1');
            mid = para.replace(reg2, '$1');
            uid = para.replace(reg3, '$1');
            that.children[0].children[8].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
            that.children[0].children[10].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
            that.children[0].children[12].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
        }
    },

    search : function(that){

        if(that.parentNode.className === 'smallcursor'){
            that = that.parentNode.parentNode;
            multiPics = false;
        }else{
            that = that.parentNode.parentNode.parentNode.parentNode.parentNode;
            multiPics = true;
        }

        quote = (that.className === 'expand' && that.getAttribute('node-type') === 'feed_list_media_disp');
        format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
        cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
        if(!quote){
            para = that.parentNode.parentNode.getElementsByClassName('info')[0].children[0].children[2].getAttribute('action-data');
            uid = para.replace(reg4, '$1');
            mid = para.replace(reg5, '$1');
        }else{
            if(multiPics){
                para = that.parentNode.parentNode.parentNode.getElementsByClassName('info')[1].children[0].children[2].getAttribute('action-data');
            }else{
                para = that.parentNode.parentNode.children[2].children[0].children[2].getAttribute('action-data');
            }
            uid = para.replace(reg10, '$1');
            mid = para.replace(reg12, '$1');
        }
        pid = para.replace(reg9, '$1');

        if(that.children[0].getElementsByClassName('wlp_el').length === 0){
            insertEls(that.children[0], uid, mid, pid, format, cdn, multiPics);
        }else{
            format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
            cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
            para = that.getElementsByClassName('show_big')[0].href;
            pid = para.replace(reg1, '$1');
            mid = para.replace(reg2, '$1');
            uid = para.replace(reg3, '$1');
            that.children[0].children[8].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
            that.children[0].children[10].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
            that.children[0].children[12].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
        }
    },

    huati : function(that){

        that = that.parentNode.parentNode;
        if(that.parentNode.className.indexOf('media_bigbox') >= 0 && that.getAttribute('node-type') !== 'imagesBox'){
            that = that.parentNode.children[0];
            para = that.parentNode.parentNode.parentNode.getElementsByClassName('con_opt')[0].children[1].children[0].children[2].getAttribute('action-data');
            format = that.children[0].children[4].href.replace(reg7, '$1');
            cdn = that.children[0].children[4].href.replace(reg6, '$1');
            pid = that.children[0].children[4].href.replace(reg8, '$1');
            mid = para.replace(reg5, '$1');
            uid = para.replace(reg4, '$1');
            insertEls(that.children[0], uid, mid, pid, format, cdn, false);
        }else{
            that = that.parentNode.parentNode.parentNode;
            para = that.children[0].children[4].href;
            format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
            cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
            pid = para.replace(reg1, '$1');
            mid = para.replace(reg2, '$1');
            uid = para.replace(reg3, '$1');

            if(that.children[0].getElementsByClassName('wlp_el').length === 0){
                insertEls(that.children[0], uid, mid, pid, format, cdn, true);
            }else{
                para = that.children[0].children[4].href;
                format = that.getElementsByTagName('IMG')[0].src.replace(reg7, '$1');
                cdn = that.getElementsByTagName('IMG')[0].src.replace(reg6, '$1');
                pid = para.replace(reg1, '$1');
                mid = para.replace(reg2, '$1');
                uid = para.replace(reg3, '$1');
                that.children[0].children[12].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
                that.children[0].children[14].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
                that.children[0].children[1].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
            }
        }
    }
};

/* -小图- */

if(_on){
    wlp_floatbar = {

        //判断浮动条开关状态
        status : true,

        //判断浮动条本页面显隐
        on : true,

        //工具条隐藏
        hide : function(){
            t = window.setTimeout(function(){
                wlp_floatbar.el.style.opacity = '0';
                wlp_floatbar.el.removeEventListener('mouseout', this.hide, false);
                ht = window.setTimeout(function(){
                    wlp_floatbar.el.style.visibility = 'hidden';
                }, 100);
            }, 500);
        },

        //工具条贴到元素上
        stick : function(node){
            clearTimeout(t);
            clearTimeout(ft);
            clearTimeout(ht);
            var left = node.getBoundingClientRect().left + (document.body.scrollLeft || document.documentElement.scrollLeft) - 39;
            var top = node.getBoundingClientRect().top + (document.body.scrollTop || document.documentElement.scrollTop);
            this.el.style.left = left + 'px';
            this.el.style.top = top + 'px';
            this.el.style.opacity = '1';
            this.el.style.visibility = 'visible';
            node.addEventListener('mouseout', this.hide, false);
        },

        //工具条关闭
        close : function(){
            clearTimeout(t);
            clearTimeout(ft);
            clearTimeout(ht);
            this.el.style.opacity = '0';
            this.el.style.visibility = 'hidden';
        },

        //工具条设置属性
        property : function(uid, mid, pid, format, cdn, multiPics){
            $id('wlp_floatbar_1').href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
            if(multiPics){
                $id('wlp_floatbar_2').style.display = 'none';
            }else{
                $id('wlp_floatbar_2').style.display = 'block';
                $id('wlp_floatbar_2').href = 'http://photo.weibo.com/' + uid + '/talbum/detail/photo_id/' + mid;
            }
            $id('wlp_floatbar_3').href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
        },

        //删除浮动条
        remove : function(){
            this.close();
            this.el.className = 'wlp_floatbar_hide';
            this.on = false;
            try{
                removeNodeInsertedListener(wlp_bind.Main);
                removeNodeInsertedListener(wlp_bind.Hot);
                removeNodeInsertedListener(wlp_bind.Search);
                removeNodeInsertedListener(wlp_bind.Enterprise);
                removeNodeInsertedListener(wlp_bind.Media);
                removeNodeInsertedListener(wlp_bind.Huati);
            }catch(err){}
            $id('wlp_floatbar_1').onclick = null;
            $id('wlp_floatbar_2').onclick = null;
            $id('wlp_floatbar_3').onclick = null;
            $id('wlp_floatbar_4').onclick = null;
            $id('wlp_floatbar_5').onclick = null;
            delete wlp_bind; //清除所有小图的监视并释放
        }
    };

    //绑定小图
    var bindSmall = {

        main : function(){
            wlp_bind.Main = addNodeInsertedListener('img.bigcursor:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.main(that);
            });
        },

        media : function(){
            wlp_bind.Media = addNodeInsertedListener('img.imgicon:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.media(that);
            });
        },

        enterprise : function(){
            wlp_bind.Enterprise = addNodeInsertedListener('img.bigcursor:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.enterprise(that);
            });
        },

        hot : function(){
            wlp_bind.Hot = addNodeInsertedListener('img.bigcursor:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.hot(that);
            });
        },

        search : function(){
            wlp_bind.Search = addNodeInsertedListener('img.bigcursor:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.search(that);
            });
        },

        huati : function(){
            wlp_bind.Huati = addNodeInsertedListener('img.bigcursor:hover', function(e){
                that = e.target || event.target;
                if(that.src.indexOf('service.mix') > 0){return;}
                wlp_floatbar.close();
                entrySmall.huati(that);
            });
        }
    };

    //鼠标移动到小图后的行为
    var entrySmall = {

        main : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');//图片格式
            cdn = that.src.replace(reg6, '$1');//图片 CDN 地址
            if(that.parentNode.className.indexOf('bigcursor') >= 0){
                para = that.parentNode.getAttribute('action-data').replace(reg11, '').split('&');
                pid = para[2];
                mid = para[1];
                uid = para[0];
                multiPics = false;
            }else{
                pid = that.getAttribute('action-data').replace('pic_id=', '');
                that = that.parentNode.parentNode.parentNode;
                mid = that.getAttribute('action-data').replace(reg5, '$1');
                uid = that.getAttribute('action-data').replace(reg4, '$1');
                multiPics = true;
            }
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        media : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            var tmpNode = that.parentNode.parentNode.parentNode.parentNode;
            if(that.parentNode.parentNode.parentNode.parentNode.children[0].className.indexOf('source') >= 0){
                uid = tmpNode.children[0].children[0].getAttribute('uid');
                mid = tmpNode.getElementsByClassName('source_att')[0].children[0].children[1].getAttribute('rid');
            }else{
                uid = tmpNode.getElementsByClassName('rt')[0].children[0].getAttribute('lastforwarder');
                mid = that.parentNode.parentNode.parentNode.id.replace('prev_', '');
            }
            multiPics = false;
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        }, 

        enterprise : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            if(that.parentNode.parentNode.parentNode.className.indexOf('content') >= 0){
                para = that.parentNode.parentNode.parentNode.getElementsByClassName('info')[0].children[0].children[0].getAttribute('action-data');
                uid = para.replace(reg4, '$1');
                mid = para.replace(reg5, '$1');
            }else{
                para = that.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('info')[1].children[0].children[0].getAttribute('action-data');
                uid = para.replace(reg10, '$1');
                mid = para.replace(reg12, '$1');
            }
            multiPics = false;
            wlp_floatbar.stick(that);
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        hot : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            if(that.parentNode.className.indexOf('bigcursor') >= 0){
                para = that.parentNode.getAttribute('action-data').replace(reg11, '').split('&');
                mid = para[1];
                uid = para[0];
                multiPics = false;
            }else{
                that= that.parentNode.parentNode;
                mid = that.getAttribute('action-data').replace(reg5, '$1');
                uid = that.getAttribute('action-data').replace(reg4, '$1');
                multiPics = true;
            }
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        search : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            if(that.getAttribute('action-type').indexOf('feed_list_media_img') >= 0){
                para = that.getAttribute('action-data').replace(reg11, '').split('&');
                mid = para[1];
                uid = para[0];
                multiPics = false;
            }else{
                that = that.parentNode.parentNode.parentNode;
                mid = that.getAttribute('action-data').replace(reg5, '$1');
                uid = that.getAttribute('action-data').replace(reg4, '$1');
                multiPics = true;
            }
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        huati : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            if(that.parentNode.parentNode.children.length === 1){
                mid = that.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('mids') || that.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('list-data');
                mid = mid.replace(reg5, '$1');
                uid = that.parentNode.parentNode.parentNode.parentNode.parentNode.children[0].children[0].getAttribute('action-data').replace(reg4, '$1');
                multiPics = false;
            }else if(that.parentNode.parentNode.className.indexOf('pic_list') >= 0){
                mid = that.parentNode.parentNode.getAttribute('action-data').replace(reg5, '$1');
                uid = that.parentNode.parentNode.getAttribute('action-data').replace(reg4, '$1');
                multiPics = true;
            }else{
                that = that.parentNode.parentNode.parentNode.parentNode.parentNode;
                uid = that.children[0].children[0].getAttribute('action-data').replace(reg4, '$1');
                mid = that.parentNode.parentNode.getAttribute('list-data').replace(reg5, '$1');
                multiPics = false;
            }
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        }
    };

    //小图功能初始化
    //创建工具条
    var div = document.createElement('div');
    div.id = 'wlp_floatbar';
    div.innerHTML = '<a href="#" target="_blank" id="wlp_floatbar_1" title="进入相册大图页面">图</a><a href="#" target="_blank" id="wlp_floatbar_2" title="进入相册详情页面，这里可以看到图片的全部评论">详</a><a href="#" target="_blank" id="wlp_floatbar_3" title="大图原始地址，在此点右键可以另存图像或者复制地址转发给别人">源</a><a href="javascript:;" id="wlp_floatbar_5" title="使用画廊模式浏览本页大图">览</a><a href="javascript:;" id="wlp_floatbar_4" title="临时关闭我要看大图工具条，刷新页面后失效\n你可以在上方的工具栏设置菜单内永久关闭浮动工具条">X</a>';
    document.body.appendChild(div);

    //为工具条按钮创建事件
    $id('wlp_floatbar_1').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_2').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_3').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_4').onclick = function(){wlp_floatbar.remove();}
    $id('wlp_floatbar_5').onclick = function(){
        if(wlp_floatbar.on){wlp_floatbar.close();}
        imgs = document.querySelectorAll('img.bigcursor, img.imgicon');
        src = $id('wlp_floatbar_3').href;
        for(var i in imgs){
            //获取当前图片的次序
            if(imgs[i].src.replace(reg14, 'large') === src){
                imgNum = i;
                break;
            }
        }
        _mode === true ? true : src = $id('wlp_floatbar_3').href.replace('large', 'bmiddle');
        imgReady(src, function(){calcPos(this.height, this.width, src)});
        imgDiv.style.visibility = 'visible';
        imgDiv.style.opacity = '1';
        noti.innerHTML = '正在读取...';
        bindDocument();
    };

    //为工具条创建监听事件
    wlp_floatbar.el = $id('wlp_floatbar');
    wlp_floatbar.el.addEventListener('mouseover', function(){
        clearTimeout(ht);
        clearTimeout(ft);
        clearTimeout(t);
    }, false);
    wlp_floatbar.el.addEventListener('mouseout', function(){
        ft = window.setTimeout(function(){
            wlp_floatbar.el.style.opacity = '0';
            ht = window.setTimeout(function(){
                    wlp_floatbar.el.style.visibility = 'hidden';
            }, 100);
        }, 500);
    }, false);
}else{
    wlp_floatbar.status = wlp_floatbar.on = false;
};

/* -画廊- */

//读取和设置 transform
var getTrans = function(){
    if(_css){
        scale = parseFloat(img.parentNode.style.transform.replace(reg15, '$1'));
        rotate = parseInt(img.parentNode.style.transform.replace(reg16, '$1'));
    }else{
        scale = parseFloat(img.parentNode.style.webkitTransform.replace(reg15, '$1'));
        rotate = parseInt(img.parentNode.style.webkitTransform.replace(reg16, '$1'));
    }
    return [scale, rotate];
}
var setTrans = function(scale, rotate){
    if(_css){
        img.parentNode.style.transform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
    }else{
        img.parentNode.style.webkitTransform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
    }
}

//建立图像层
    var imgDiv = document.createElement('div');
    imgDiv.id = 'wlp_img_wrap';
    imgDiv.innerHTML = '<div id="wlp_img_container"><div id="wlp_img_drag"><img id="wlp_img"/></div></div><div id="wlp_img_controler"><a href="javascript:;" id="wlp_img_exit" >退出</a><a href="javascript:;" id="wlp_img_help">帮助</a><a id="wlp_img_prev" title="浏览上一张图片">上一张</a><a id="wlp_img_left">向左转</a><a id="wlp_img_ratio" title="重置图像缩放比例和旋转">1.0</a><a id="wlp_img_mode" title="浏览模式，大图或中图"></a><a id="wlp_img_ori" title="原始比例">1:1</a><a id="wlp_img_right">向右转</a><a id="wlp_img_next" title="浏览下一张图片">下一张</a></div><div id="wlp_img_noti"></div></div>';
    document.body.appendChild(imgDiv);

    //图像滚动
    imgDiv.onmousewheel = function(e){
        var e = e || window.event;
        var top = parseInt(img.parentNode.style.top.replace('px', ''));
        top += e.wheelDelta / 3;
        img.parentNode.style.top = top + 'px';
        return false;
    }
    //Firefox 兼容图像滚动
    imgDiv.addEventListener('DOMMouseScroll', function(e){
        var e = e || window.event;
        var top = parseInt(img.parentNode.style.top.replace('px', ''));
        top -= e.detail / 3 * 40;
        img.parentNode.style.top = top + 'px';
        e.stopPropagation();
        e.preventDefault();
        return false;
    }, false); 


//图像元素
    var img = $id('wlp_img');
    setTrans('1', '0');
    img.style.opacity = '0';
    //图像拖动
    img.onmouseover = function(){
        dragF.drag('wlp_img_drag');
        $id('wlp_img_controler').style.opacity = '.1';
    }
    img.onmouseout = function(){
        $id('wlp_img_controler').style.opacity = '.4';
    }
    //图片读取完成后才显示
    img.onload = function(){
        this.style.visibility = 'visible';
        this.style.opacity = '1';
        noti.innerHTML = '';
    }
    //图片读取错误
    img.onerror = function(){
        noti.innerHTML = '读取失败...';
    }
    //双击图像退出
    img.ondblclick = function(){exitGallery()};
    //鼠标滚轮缩放图像
    img.parentNode.onmousewheel = function(e){
        //使用 transform 缩放图像
        var e = e || window.event;
        e.cancelBubble = true; //避免上层 DOM 事件触发
        var trans = getTrans();
        trans[0] += e.wheelDelta / 2400;
        if(trans[0] > 0.01 && trans[0] < 10){
            trans[0] = Math.round(trans[0] * 100) / 100;
            setTrans(trans[0], trans[1]);
            ratio.innerHTML = trans[0].toString();
        }
        return false;
    }
    //Firefox 兼容鼠标滚轮缩放图像
    img.parentNode.addEventListener('DOMMouseScroll', function(e){
        var e = e || window.event;
        e.cancelBubble = true; //避免上层 DOM 事件触发
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;
        var trans = getTrans();
        trans[0] -= e.detail / 60;
        if(trans[0] > 0.01 && trans[0] < 10){
            trans[0] = Math.round(trans[0] * 100) / 100;
            setTrans(trans[0], trans[1]);
            ratio.innerHTML = trans[0].toString();
        }
        return false;
    }, false);

//浏览按钮
    $id('wlp_img_next').onclick = function(){nextImg();}
    $id('wlp_img_prev').onclick = function(){prevImg();}
    //按钮退出
    $id('wlp_img_exit').onclick = function(){exitGallery()};
    //图像旋转按钮
    $id('wlp_img_right').onclick = function(){
        var trans = getTrans();
        trans[1] = trans[1] + 90;
        if(trans[1] >= 360 || trans[1] <= -360){
            trans[1] = 0;
        }
        setTrans(trans[0], trans[1]);
    }
    $id('wlp_img_left').onclick = function(){
        var trans = getTrans();
        trans[1] = trans[1] - 90;
        if(trans[1] >= 360 || trans[1] <= -360){
            trans[1] = 0;
        }
        setTrans(trans[0], trans[1]);
    }
    //帮助按钮
    $id('wlp_img_help').onclick = function(){
        alert('鼠标操作：\n\n缩放图片：在图片上滚动鼠标滚轮可以放大缩小图像。\n拖动图片：在图片上按住鼠标左键可以自由拖动图片。\n滚动图片：在空白区域滚动滚轮可以滚动图片。\n\n1:1 按钮：点击使图片按原始大小显示。\n比例按钮：显示缩放比例，点击使图片恢复到初始状态。\n旋转按钮：点击旋转图像方向。\n\n浏览模式：浏览大图或中图。\n\n退出画廊模式：双击图片或点击退出按钮。\n\n\n\n键盘操作：\n\n左右方向：切换图片。\n上下方向：滚动图片。\n空格：1:1 与初始状态切换。\nESC：退出画廊模式。')
    }
    //缩放 1：1 按钮
    $id('wlp_img_ori').onclick = function(){scaleOri();}

//其他地方需要用到的元素
    var ratio = $id('wlp_img_ratio');
    var noti = $id('wlp_img_noti');
    var mode = $id('wlp_img_mode');
    //模式，大图还是中图
    _mode === true ? mode.innerHTML = '大图' : mode.innerHTML = '中图';//初始化时根据设置显示文字
    mode.onclick = function(){
        clearTimeout(it);
        it = setTimeout(function(){
            img.style.visibility = 'hidden';
        }, 200);
        _view = true;
        noti.innerHTML = '正在读取...';
        img.style.opacity = '0';
        _mode = _mode === true ? false : true;
        if(_mode){
            mode.innerHTML = '大图';
            src = imgs[imgNum].src.replace(reg14, 'large');
        }else{
            mode.innerHTML = '中图';
            src = imgs[imgNum].src.replace(reg14, 'bmiddle');
        }
        imgReady(src, function(){calcPos(this.height, this.width, src)});
        save('mode', _mode);
    }
    //显示缩放比例和适合屏幕的按钮
    ratio.onclick = function(){
        calcPos(img.height, img.width, '');
    }
    //空格切换状态按钮，true 时应为适合屏幕缩放状态
    _view = true;
//复用函数
    //1:1
    var scaleOri = function(){
        var trans = getTrans();
        setTrans('1', trans[1]);
        if(img.height > window.innerHeight * 0.8){
            img.parentNode.style.top = '40px'; //图像上边不超过屏幕，阅读长微博很合适
        }
        ratio.innerHTML = '1';
    }
    //退出画廊
    var exitGallery = function(){
        clearTimeout(it);
        it = setTimeout(function(){
            imgDiv.style.visibility = 'hidden';
            //置入一个 1X1 的 png 清空之前的图像
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACXZwQWcAAAABAAAAAQDHlV/tAAAAAnRSTlMA/1uRIrUAAAAKSURBVAjXY/gPAAEBAQAbtu5WAAAAAElFTkSuQmCC';
        }, 500);
        _view = true;
        imgDiv.style.opacity = '0';
        document.onkeydown = null;
    }
    //下一张
    var nextImg = function(){
        clearTimeout(it);
        it = setTimeout(function(){
            img.style.visibility = 'hidden';
        }, 200);
        _view = true;
        noti.innerHTML = '正在读取...';
        img.style.opacity = '0';
        imgNum++;
        if(imgNum > imgs.length - 1|| imgNum < 0){imgNum = 0;}
        _mode === true ? src = imgs[imgNum].src.replace(reg14, 'large') : src = imgs[imgNum].src.replace(reg14, 'bmiddle');
        imgReady(src, function(){calcPos(this.height, this.width, src)});
    }
    //上一张
    var prevImg = function(){
        clearTimeout(it);
        it = setTimeout(function(){
            img.style.visibility = 'hidden';
        }, 200);
        _view = true;
        noti.innerHTML = '正在读取...';
        img.style.opacity = '0';
        imgNum--;
        if(imgNum > imgs.length - 1 || imgNum < 0){imgNum = imgs.length - 1;}
        _mode === true ? src = imgs[imgNum].src.replace(reg14, 'large') : src = imgs[imgNum].src.replace(reg14, 'bmiddle');
        imgReady(src, function(){calcPos(this.height, this.width, src)});
    }

//绑定页面按键监听
var bindDocument = function(){
    document.onkeydown = function(e){
        e = e || window.event;
        e.cancelBubble = true;
        //上下和空格不触发页面滚动
        if(e.keyCode == 38 || e.keyCode == 32 || e.keyCode == 40){
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
        }
        switch(e.keyCode){//ESC 空格 右上左下
            case 27 : exitGallery();break;
            case 32 : _view === false ? calcPos(img.height, img.width, '') : scaleOri();_view = !_view;break;
            case 37 : prevImg();break; 
            case 38 : img.parentNode.style.top = parseInt(img.parentNode.style.top.replace('px','')) + 30 + 'px';break;
            case 39 : nextImg();break;
            case 40 : img.parentNode.style.top = parseInt(img.parentNode.style.top.replace('px','')) - 30 + 'px';break;
        }
    }
}

//根据图像大小，计算图像位置和缩放程度
var calcPos = function(height, width, src){
    if(height > window.innerHeight * 0.8){
        var imgHeightRatio = (window.innerHeight - 50) * 0.8 / height;
    }else{
        var imgHeightRatio = 1;
    }
    if(width > document.body.offsetWidth * 0.8){
        var imgWidthRatio = document.body.offsetWidth * 0.8 / width;
    }else{
        var imgWidthRatio = 1;
    }
    var scale = Math.floor((imgHeightRatio || imgWidthRatio) * 100) / 100;
    setTrans(scale, '0');
    img.parentNode.style.left = (document.body.offsetWidth - width) / 2 + 'px';
    img.parentNode.style.top = (window.innerHeight - 40 - height) / 2 + 'px';
    if(src !== ''){
        img.src = src;
    }
    ratio.innerHTML = scale;
}

//图像拖曳
var dragF = {
    locked : false,
    lastObj : undefined,
    drag : function(obj){
        $id(obj).onmousedown = function(e){
            var e = e ? e :window.event;
            if(!window.event){
                e.stopPropagation();
                e.preventDefault();
                e.returnValue = false;
            }
            dragF.locked = true;
            $id(obj).style.position = 'absolute';
            dragF.lastObj = $id(obj);
            var tempX = $id(obj).offsetLeft;
            var tempY = $id(obj).offsetTop;
            dragF.x = e.clientX;
            dragF.y = e.clientY;
            document.onmousemove = function(e){
                var e = e ? e :window.event;
                if(dragF.locked == false){return false;}
                $id(obj).style.left = tempX + e.clientX - dragF.x + 'px';
                $id(obj).style.top = tempY + e.clientY - dragF.y + 'px';
                if(window.event){
                    e.returnValue = false;
                }
            };
            document.onmouseup = function(){
                dragF.locked = false;
            };
        };
    }
};



/* -初始化- */

//判断页面类型，主入口
if($id('pl_content_homeFeed') !== null){
    bindLarge.main(); //本人时间线
    if(_on){bindSmall.main();}
}else if($id('pl_content_hisFeed') !== null && !enterprise){
    bindLarge.main(); //他人时间线
    if(_on){bindSmall.main();}
}else if(enterprise || gov){
    bindLarge.enterprise(); //企业版、政府版、专业版时间线
    if(_on){bindSmall.enterprise();}
}else if(search){
    bindLarge.search(); //搜索页面
    if(_on){bindSmall.search();}
}else if(hot){
    bindLarge.hot(); //热门页面
    if(_on){bindSmall.hot();}
}else if(media){
    bindLarge.media(); //媒体版页面
    if(_on){bindSmall.media();}
}else if(huati){
    bindLarge.huati(); //话题页面
    if(_on){bindSmall.huati();}
}else if($id('plc_main') !== null){
    bindLarge.main(); //另外一种媒体版页面，域名不带 media，结构和普通版基本一样，如北京青年报
    if(_on){bindSmall.main();}
}

//建立选项元素
var option = document.createElement('li');
option.title = '新浪微博之我要看大图浮动工具栏设置';
if(_on){
    option.innerHTML = '<a href="javascript:;" id="wlp_option_btn">看大图浮动栏（开）</a>';
}else{
    option.innerHTML = '<a href="javascript:;" id="wlp_option_btn">看大图浮动栏（关）</a>';
    option.className = 'wlp_btn_grey';
}

//选项保存方法
var save = function(name, value){
    switch(_type){
        case 1 : GM_setValue(name, value);
            break;
        case 2 : localStorage[name] = value;
            break;
        case 3 : window.pb.storage.setConfig(name, value);
            break;
    }
}

//设置菜单 dom 建立时将选项添加到设置菜单
var bindOption = addNodeInsertedListener('.gn_text_list li a', function(){
    document.getElementsByClassName('gn_text_list')[3].appendChild(option);
    option = null;

    //选项按钮相关
    var btn = $id('wlp_option_btn');
    btn.onclick = function(){
        if(wlp_floatbar.status){
            save('floatbar', false);
            btn.parentNode.className = 'wlp_btn_grey';
            btn.innerHTML = '看大图浮动栏（关）';
            wlp_floatbar.remove();
            wlp_floatbar.status = false;
        }else{
            save('floatbar', true);
            confirm('重新开启浮动栏需要刷新页面。\n\n点击“确定”立即刷新页面；\n点击“取消”那就待会儿再说~') === true ? window.location.reload() : true;
        }
    };

    removeNodeInsertedListener(bindOption);
});