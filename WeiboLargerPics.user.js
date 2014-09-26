// ==UserScript==
// @name           Weibo Larger Pics
// @name:zh        新浪微博之我要看大图
// @name:en        Weibo Larger Pics
// @namespace      http://xiaoxia.de/
// @description    新浪微博看图增强脚本：画廊模式：轻松查看本页所有大图；缩略图增加浮动工具栏：快速进入大图页面、图片详情页面和原始地址。
// @license        GNU Lesser General Public License (LGPL)
// @version        1.2.3.10
// @author         xiaoxia
// @supportURL     https://github.com/neverweep/Weibo-Larger-Pics/issues
// @copyright      xiaoxia, GNU Lesser General Public License (LGPL)
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_addStyle
// @include        http://t.sina.com.cn/*
// @include        http://weibo.com/*
// @include        http://www.weibo.com/*
// @include        http://media.weibo.com/*
// @include        http://s.weibo.com/*
// @include        http://s.weibo.com/pic/*
// @include        http://hot.weibo.com/*
// @include        http://huati.weibo.com/*
// @include        http://photo.weibo.com/*
// @exclude        http://s.weibo.com/user/*
// @exclude        http://weibo.com/app/*
// @exclude        http://weibo.com/app
// @updateURL      https://greasyfork.org/scripts/5038.js
// @downloadURL    https://greasyfork.org/scripts/5038.js
// ==/UserScript==

(function(){

/* -getId- */
var $id = function(id) {
    return document.getElementById(id);
};

/* -监听动画方法- */
/** http://g.mozest.com/thread-42401-1-1 **/
function addStyleCompatible(a){var b,d,c;'undefined'!=typeof GM_addStyle?'undefined'==typeof GM_updatingEnabled||0!==document.getElementsByTagName('head').length?GM_addStyle(a):b=window.setInterval(function(){0!==document.getElementsByTagName('head').length&&(window.clearInterval(b),GM_addStyle(a))},3):'undefined'!=typeof addStyle?addStyle(a):(c=document.querySelector('head'),c&&(d=document.createElement('style'),d.type='text/css',d.innerHTML=a,c.appendChild(d)))}function addNodeInsertedListener(a,b,c,d){var i,j,k,e='anilanim',f=['-moz-','-webkit-',''],g=['animationstart','webkitAnimationStart'],h=function(a,b){for(var c=0,d=a.length;d>c;c++)b(a[c])};return d||(i=a+'{',j='',h(f,function(a){i+=a+'animation-duration:.001s;'+a+'animation-name:'+e+';',j+='@'+a+'keyframes '+e+'{from{opacity:1;}to{opacity:1;}}'}),i+='}'+j,addStyleCompatible(i)),b?(k=function(d){var e=document.querySelectorAll(a),f=d.target;0!==e.length&&h(e,function(a){return f===a?(c&&removeNodeInsertedListener(k),b.call(f,d),void 0):void 0})},h(g,function(a){document.addEventListener(a,k,!1)}),k):void 0}function removeNodeInsertedListener(a){var b=['animationstart','webkitAnimationStart'],c=function(a,b){for(var c=0,d=a.length;d>c;c++)b(a[c])};c(b,function(b){document.removeEventListener(b,a,!1)})}

/* -判断图像大小- */
/**
 * 图片头数据加载就绪事件 - 更快获取图片尺寸
 * @version 2011.05.27
 * @author  TangBin
 * @see     http://www.planeart.cn/?p=1121
 */
var imgReady=function(){var e=[],t=null,n=function(){var t=0;for(;t<e.length;t++)e[t].end?e.splice(t--,1):e[t]();!e.length&&r()},r=function(){clearInterval(t),t=null};return function(r,i,s,o){var u,a,f,l,c,h=new Image;h.src=r;if(h.complete){i.call(h),s&&s.call(h);return}a=h.width,f=h.height,h.onerror=function(){o&&o.call(h),u.end=!0,h=h.onload=h.onerror=null},u=function(){l=h.width,c=h.height;if(l!==a||c!==f||l*c>1024)i.call(h),u.end=!0},u(),h.onload=function(){!u.end&&u(),s&&s.call(h),h=h.onload=h.onerror=null},u.end||(e.push(u),t===null&&(t=setInterval(n,40)))}}();

/* -全局- */

//判断浏览器以确定读取和储存方法
var _type, _on, _mode, _css, _cdn, GM_getValue;
_css = typeof(document.body.style.transform) !== 'undefined'; //判断浏览器是否支持标准 css 属性

if(typeof(GM_getValue) !== 'undefined'){
    //Firefox 和 Chrome + Tampermonkey 和其它使用 GM 的浏览器使用 GM 方法储存
    _on = GM_getValue('floatbar', true);
    _mode = GM_getValue('mode', true);
    __view = GM_getValue('view', true);
    __cdn = GM_getValue('cdn', 0);
    _type = 1;
}else if(typeof(window.chrome) !== 'undefined'){
    //Chrome 使用 localstorage 储存
    _on = localStorage['floatbar'] === 'true' || typeof(localStorage['floatbar']) === 'undefined';
    _mode = localStorage['mode'] === 'true' || typeof(localStorage['mode']) === 'undefined';
    __view = localStorage['view'] === 'true' || typeof(localStorage['view']) === 'undefined';
    __cdn = typeof(localStorage['cdn']) === 'undefined' ?  0 : parseInt(localStorage['cdn']);
    _type = 2;
}else if(typeof(window.external.mxGetRuntime) !== 'undefined'){
    //Maxthon 插件版使用原生接口储存
    var pb = window.external.mxGetRuntime();
    _on = window.pb.storage.getConfig('floatbar');
    _on = (_on === '' || _on === 'true');
    _mode = window.pb.storage.getConfig('mode');
    _mode = (_mode === '' || _mode === 'true');
    __view = window.pb.storage.getConfig('view');
    __view = (__view === '' || __view === 'true');
    __cdn = window.pb.storage.getConfig('cdn');
    __cdn = (_cdn === '' || _cdn === '0') ? 0 : parseInt(_cdn);
    _type = 3;
}else{
    //以上都不支持的浏览器常开
    _on = true;
    _mode = true;
    __view = true;
    __cdn = 0;
}

function checkSetting(name, value){
    if(typeof(name) == "undefined" || name == null)
        name = value;
}

checkSetting(_on, true);
checkSetting(_mode, true);
checkSetting(__view, true);
checkSetting(_cdn, 0);

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


//加入需要的 CSS
addStyleCompatible('\
/* 选项*/\
#wlp_cdn {\
    position: fixed;\
    top: 10%;\
    width: 100%;\
    z-index: 999999\
}\
#wlp_cdn>div {\
    width: 600px;\
    background: #FFF;\
    border: 1px solid #CCC;\
    box-shadow: 0 1px 15px rgba(0, 0, 0, 0.85);\
    padding: 20px;\
    margin: 0 auto\
}\
#wlp_cdn span {\
    margin: 0 5px;\
    display: inline-block;\
    width: 5em;\
    text-align: right\
}\
#wlp_cdn p {\
    margin: 1em 0\
}\
/* 画廊*/\
#wlp_img_wrap {\
    -moz-user-select: none;\
    -webkit-user-select: none;\
    user-select: none;\
    position: fixed;\
    width: 100%;\
    height: 100%;\
    left: 0;\
    top: 0;\
    z-index: 9999;\
    background: rgba(0,0,0,.95);\
    opacity: 0;\
    visibility: hidden;\
    transition: opacity .3s ease-out 0s;\
}\
#wlp_img_drag {\
    position: absolute;\
    z-index: 100;\
}\
#wlp_img {\
    transition: opacity .2s ease-out 0s;\
    opacity: 0;\
}\
#wlp_img {\
    cursor: move\
}\
#wlp_img_controler {\
    opacity: .4;\
    transition: opacity .3s ease-out 0s;\
    position: fixed;\
    bottom: 0;\
    left: 0;\
    width: 100%;\
    background: rgba(255,255,255,.7);\
    text-align: center;\
    z-index: 100\
}\
#wlp_img_controler:hover {\
    opacity: 1 !important;\
}\
#wlp_img_controler a, #wlp_cdn a {\
    color: #333;\
    padding: 5px 10px;\
    border: 1px solid #CCC;\
    background: #FFF;\
    margin: 10px;\
    display: inline-block;\
    line-height: 1\
}\
#wlp_img_controler a:hover, #wlp_cdn a:hover {\
    text-decoration: none;\
    border: 1px solid #2AC;\
    background: #2AC;\
    color: #FFF;\
    cursor: pointer\
}\
#wlp_img_ratio {\
    width: 2em\
}\
#wlp_img_pullleft {\
    position: absolute;\
    left: 0;\
    line-height: 1\
}\
#wlp_img_pullright {\
    position: absolute;\
    right: 0;\
    line-height: 1\
}\
#wlp_img_noti {\
    position: absolute;\
    left: 48%;\
    top: 50%;\
    color: #FFF;\
    border-radius:20px;\
    background:rgba(128,128,128,0.5);\
    padding:10px;\
}\
#wlp_img_counter {\
    transition: opacity .3s ease-out 0s;\
    position: absolute;\
    top: 2%;\
    right: 2%;\
    color: #FFF;\
    text-shadow: 0, 0, 5px, #333\
    border-radius:10px;\
    background:rgba(80,80,80,0.5);\
    padding:5px;\
    z-index:9999;\
    min-width:5em;\
    text-align:center;\
}\
#wlp_img_user {\
    position: fixed;\
    right: 20px;\
    top: 20px;\
    padding: 0\
}\
#wlp_img_user a {\
    border: none !important;\
    border-radius: 5px;\
    padding: 0;\
    overflow: hidden;\
    background: transparent !important\
}\
/* 浮动栏*/\
#wlp_floatbar {\
    background: #FFF;\
    border: 1px solid #CCC;\
    width: 28px;\
    overflow: hidden;\
    position: absolute;\
    padding: 8px 2px;\
    text-align: center;\
    line-height: 1.9;\
    z-index: 9998;\
    opacity: 0;\
    transition: opacity 0.1s ease-out 0s\
}\
#wlp_floatbar:hover {\
    border-color: #2AC\
}\
#wlp_floatbar a {\
    display: block;\
}\
.wlp_floatbar_hide {\
    display: none !important\
}\
');

//基本变量
var uid, pid, mid, format, para, cdn, multiPics, quote, t, ft, ht, it, imgNum = 0, imgs = [], parent;
//版面判断。公益版使用 iframe，无法支持。
var media = window.location.host === 'media.weibo.com', //判断媒体版微博
    search = window.location.host === 's.weibo.com', //判断搜索页面
    searchPic = window.location.host === 's.weibo.com' && window.location.href.indexOf('s.weibo.com/pic/') > 0, //判断搜索照片页面
    hot = window.location.host === 'hot.weibo.com', //判断热门页面
    huati = window.location.host === 'huati.weibo.com', //判断话题页面
    gov = window.location.host === 'gov.weibo.com'; //判断 ZF 页面，但是似乎所有 ZF 版都是用 e.weibo.com
    photo = window.location.host === 'photo.weibo.com'; //判断照片页面
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
    reg13 = /.*[(square)|(thumbnail)|(thumb\d+)]\/(.*)\..../,
    reg14 = /(thumbnail)|(square)|(thumb\d+)|(cmw\d+)/,
    reg15 = /.*scale\((.*?)\).*/,
    reg16 = /.*rotate\((.*?)deg\).*/,
    reg17 = /.*sinaimg.cn\/(.*?)\/.*/,
    reg18 = /.*\/(.*)/;
//小图绑定记录
var wlp_bind = {};
//浮动栏对象
var wlp_floatbar = {};


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
                document.onkeyup = null;
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
            document.onkeyup = null;
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
            //开始监听键盘事件
            document.onkeyup = function(e){
                e = e || window.event;
                if(multiPics ? '65 68 70' : '65 83 68 70'.indexOf(e.keyCode.toString()) >= 0){
                    e.cancelBubble = true;
                    e.stopPropagation();
                    e.preventDefault();
                    e.returnValue = false;
                }
                switch(e.keyCode){//ESC 空格 右上左下 Z C X V B
                    case 65 : window.open($id('wlp_floatbar_1').href, '_blank ' + Math.random());break;
                    case 83 : if(!multiPics) window.open($id('wlp_floatbar_2').href, '_blank ' + Math.random());break;
                    case 68 : window.open($id('wlp_floatbar_3').href, '_blank ' + Math.random());break;
                    case 70 : initGallery();;break;
                }
            }
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
                removeNodeInsertedListener(wlp_bind.SearchPic);
                removeNodeInsertedListener(wlp_bind.Media);
                removeNodeInsertedListener(wlp_bind.Huati);
                removeNodeInsertedListener(wlp_bind.Photo);
                removeNodeInsertedListener(wlp_bind.PhotoTag);
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
            wlp_bind.Main = addNodeInsertedListener('img.bigcursor[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.main(that);
            });
        },

        media : function(){
            wlp_bind.Media = addNodeInsertedListener('img.imgicon[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.media(that);
            });
        },

        hot : function(){
            wlp_bind.Hot = addNodeInsertedListener('img.bigcursor[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.hot(that);
            });
        },

        search : function(){
            wlp_bind.Search = addNodeInsertedListener('img.bigcursor[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.search(that);
            });
        },

        searchPic : function(){
            wlp_bind.SearchPic = addNodeInsertedListener('.list_picbox .img img[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.searchPic(that);
            });
        },

        huati : function(){
            wlp_bind.Huati = addNodeInsertedListener('img.bigcursor[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.huati(that);
            });
        },

        photo : function(){
            wlp_bind.Photo = addNodeInsertedListener('.photoList img[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.photo(that);
            });
        },

        photoTag : function(){
            wlp_bind.PhotoTag = addNodeInsertedListener('img.photo_pic[src*="sinaimg"]:hover', function(e){
                that = e.target || event.target;
                wlp_floatbar.close();
                entrySmall.photoTag(that);
            });
        },
    };

    //鼠标移动到小图后的行为
    var entrySmall = {

        main : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');//图片格式
            cdn = gallery._cdn || that.src.replace(reg6, '$1');//图片 CDN 地址
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
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
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

        hot : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
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
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
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
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
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
        },

        photo : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            mid = that.parentNode.href.replace(reg18, '$1');
            uid = that.parentNode.href.replace(reg3, '$1');
            multiPics = false;
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        photoTag : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
            pid = that.parentNode.getAttribute('action-data').replace(reg9, '$1');
            mid = that.parentNode.getAttribute('action-data').replace(reg5, '$1');
            uid = that.parentNode.getAttribute('action-data').replace(reg4, '$1');
            multiPics = false;
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },

        searchPic : function(that){
            wlp_floatbar.stick(that);
            format = that.src.replace(reg7, '$1');
            cdn = gallery._cdn || that.src.replace(reg6, '$1');
            pid = that.src.replace(reg13, '$1');
            mid = that.getAttribute('mid');
            uid = that.parentNode.parentNode.parentNode.children[1].children[0].children[0].children[0].src.replace(reg17, '$1');
            multiPics = false;
            wlp_floatbar.property(uid, mid, pid, format, cdn, multiPics);
        },
    };

    //小图功能初始化
    //创建工具条
    var div = document.createElement('div');
    div.id = 'wlp_floatbar';
    div.innerHTML = '<a href="#" target="_blank" id="wlp_floatbar_1" title="快捷键(A) 进入相册大图页面">图</a><a href="#" target="_blank" id="wlp_floatbar_2" title="快捷键(S) 进入相册详情页面，这里可以看到图片的全部评论">详</a><a href="#" target="_blank" id="wlp_floatbar_3" title="快捷键(D) 大图原始地址，在此点右键可以另存图像或者复制地址转发给别人">源</a><a href="javascript:;" id="wlp_floatbar_5" title="快捷键(F) 使用画廊模式浏览本页大图">览</a><a href="javascript:;" id="wlp_floatbar_4" title="临时关闭我要看大图工具条，刷新页面后失效\n你可以在上方的工具栏设置菜单内永久关闭浮动工具条">X</a>';
    document.body.appendChild(div);

    //为工具条按钮创建事件
    $id('wlp_floatbar_1').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_2').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_3').onclick = function(){wlp_floatbar.close();}
    $id('wlp_floatbar_4').onclick = function(){wlp_floatbar.remove();}
    function initGallery(){
        if(wlp_floatbar.on){wlp_floatbar.close();}
        imgs = document.querySelectorAll('img.bigcursor[src*="sinaimg"], img.imgicon[src*="sinaimg"], .photoList img[src*="sinaimg"], img.photo_pic[src*="sinaimg"], .list_picbox .img img[src*="sinaimg"]');
        src = $id('wlp_floatbar_3').href.replace(reg18, '$1');
        for(var i in imgs){
            //获取当前图片的次序
            if(imgs[i].src.replace(reg18, '$1') === src){
                imgNum = i;
                break;
            }
        }
        gallery.counter_now.innerHTML = parseInt(imgNum) + 1;
        gallery.counter_total.innerHTML = imgs.length;
        gallery._mode ? src = $id('wlp_floatbar_3').href : src = $id('wlp_floatbar_3').href.replace('large', 'bmiddle');  //根据浏览模式决定大图小图
        gallery._cdn === 0 ? true : src = src.replace(/ww\d\./, 'ww' + gallery._cdn + '.');  //根据 CDN 设置地址
        gallery.source.href = src.replace('bmiddle', 'large');
        imgReady(src, function(){gallery.img.style.visibility = 'visible';gallery.img.style.opacity = '0.5';gallery.calcPos(this.height, this.width, src)});
        gallery.imgDiv.style.visibility = 'visible'; //显示图像层
        gallery.imgDiv.style.opacity = '1';
        gallery.noti.style.visibility = 'visible';
        gallery.noti.innerHTML = '正在读取';
        //开始监听键盘事件
        document.onkeydown = function(e){
            e = e || window.event;
            e.cancelBubble = true;
            //上下左右和空格不触发页面滚动和事件
            if('32 37 38 39 40'.indexOf(e.keyCode.toString()) >= 0){
                e.stopPropagation();
                e.preventDefault();
                e.returnValue = false;
            }
            switch(e.keyCode){//ESC 空格 右上左下 Z C X V B
                case 27 : gallery.control.exitGallery();break;
                case 32 : gallery.calcPos(gallery.img.height, gallery.img.width, '');break;
                case 37 : gallery.control.prevImg();break;
                case 38 : gallery.img.parentNode.style.top = parseInt(gallery.img.parentNode.style.top.replace('px','')) + 30 + 'px';break;
                case 39 : gallery.control.nextImg();break;
                case 40 : gallery.img.parentNode.style.top = parseInt(gallery.img.parentNode.style.top.replace('px','')) - 30 + 'px';break;
                case 90 : gallery.control.rotateLeft();break;
                case 67 : gallery.control.rotateRight();break;
                case 88 : gallery.control.changeMode();break;
                case 86 : document.body.scrollTop = gallery.findParent().offsetTop - 50;gallery.control.exitGallery();document.documentElement.scrollTop = gallery.findParent().offsetTop - 50;break;
                case 66 : window.open(gallery.source.href, '_blank ' + Math.random());break;
            }
        }
    };
    $id('wlp_floatbar_5').onclick = function(){initGallery()};

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

var gallery = {
    imgDiv : null,
    img : null,
    ratio : null,
    noti : null,
    mode : null,
    _mode : null,
    _view : __view,
    _cdn : __cdn,
    counter_now : null,
    counter_total: null,

    init : function(){
        //建立图像层
        gallery.imgDiv = document.createElement('div');
        gallery.imgDiv.id = 'wlp_img_wrap';
        gallery.imgDiv.innerHTML = '<div id="wlp_img_container"><div id="wlp_img_drag"><img id="wlp_img"/></div></div><div id="wlp_img_controler"><span id="wlp_img_pullleft"><a href="http://xiaoxia.de/upload/donation.html">捐赠</a><a href="javascript:;" id="wlp_img_help">帮助</a><a href="javascript:;" id="wlp_img_cdn">设置</a></span><a id="wlp_img_prev" title="浏览上一张图片">上一张(←)</a><a id="wlp_img_left" title="向左旋转图片 90°">向左转(Z)</a><a id="wlp_img_ratio" title="重置图像缩放比例和旋转">1</a><a id="wlp_img_mode" title="浏览模式，大图或中图"></a><a id="wlp_img_ori" title="原始比例">1:1</a><a id="wlp_img_right" title="向右旋转图片 90°">向右转(C)</a><a id="wlp_img_next" title="浏览下一张图片">下一张(→)</a><span id="wlp_img_pullright"><a id="wlp_img_source" href="javascript:;" target="_blank" title="查看源图（永远是大图），在此右键可另存大图">源图(B)</a><a href="javascript:;" id="wlp_img_scroll" title="退出画廊模式，并将页面定位到该微博">查看微博 (V)</a><a href="javascript:;" id="wlp_img_exit" title="退出画廊模式" >退出(ESC)</a></span></div><div id="wlp_img_noti"></div><div id="wlp_img_counter"><span id="wlp_img_counter_now"></span> / <span id="wlp_img_counter_total"></span></div></div>';
        document.body.appendChild(gallery.imgDiv);

        gallery.ratio = $id('wlp_img_ratio');
        gallery.noti = $id('wlp_img_noti');
        gallery.mode = $id('wlp_img_mode');
        gallery.source = $id('wlp_img_source');
        gallery.counter_now = $id('wlp_img_counter_now');
        gallery.counter_total = $id('wlp_img_counter_total');
        gallery._mode = _mode;
        gallery._mode ? gallery.mode.innerHTML = '大图(X)' : gallery.mode.innerHTML = '中图(X)';//初始化时根据设置显示文字

        //图像滚动
        gallery.imgDiv.onmousewheel = function(e){
            var e = e || window.event;
            var top = parseInt(gallery.img.parentNode.style.top.replace('px', ''));
            top += e.wheelDelta / 3;
            gallery.img.parentNode.style.top = top + 'px';
            return false;
        }
        //Firefox 兼容图像滚动
        gallery.imgDiv.addEventListener('DOMMouseScroll', function(e){
            var e = e || window.event;
            var top = parseInt(gallery.img.parentNode.style.top.replace('px', ''));
            top -= e.detail / 3 * 40;
            gallery.img.parentNode.style.top = top + 'px';
            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);


        //图像元素
        gallery.img = $id('wlp_img');
        gallery.trans.setTrans('1', '0');
        gallery.img.style.opacity = '0';
        //图像拖动
        gallery.img.onmouseover = function(){
            gallery.dragF.drag('wlp_img_drag');
            $id('wlp_img_controler').style.opacity = '.1';
            $id('wlp_img_counter').style.opacity = '.4';
        }
        gallery.img.onmouseout = function(){
            $id('wlp_img_controler').style.opacity = '.4';
            $id('wlp_img_counter').style.opacity = '1';
        }
        //图片读取完成后才显示
        gallery.img.onload = function(){
            clearTimeout(it);
            this.style.opacity = '1';
            gallery.noti.style.visibility = 'hidden';
        }
        gallery.img.compelte = function(){
            clearTimeout(it);
            this.style.opacity = '1';
            gallery.noti.style.visibility = 'hidden';
        }
        //双击图像退出
        gallery.img.ondblclick = function(){gallery.control.exitGallery()};
        //鼠标滚轮缩放图像
        gallery.img.parentNode.onmousewheel = function(e){
            //使用 transform 缩放图像
            var e = e || window.event;
            e.cancelBubble = true; //避免上层 DOM 事件触发
            var trans = gallery.trans.getTrans();
            trans[0] += e.wheelDelta / 2400;
            if(trans[0] > 0.01 && trans[0] < 10){
                trans[0] = Math.round(trans[0] * 100) / 100;
                gallery.trans.setTrans(trans[0], trans[1]);
                gallery.ratio.innerHTML = trans[0].toString();
            }
            gallery._view = true;
            return false;
        }
        //Firefox 兼容鼠标滚轮缩放图像
        gallery.img.parentNode.addEventListener('DOMMouseScroll', function(e){
            var e = e || window.event;
            e.cancelBubble = true; //避免上层 DOM 事件触发
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            var trans = gallery.trans.getTrans();
            trans[0] -= e.detail / 60;
            if(trans[0] > 0.01 && trans[0] < 10){
                trans[0] = Math.round(trans[0] * 100) / 100;
                gallery.trans.setTrans(trans[0], trans[1]);
                gallery.ratio.innerHTML = trans[0].toString();
            }
            gallery._view = true;
            return false;
        }, false);

        //浏览按钮
        //图片前一张后一张按钮
        $id('wlp_img_next').onclick = function(){gallery.control.nextImg();}
        $id('wlp_img_prev').onclick = function(){gallery.control.prevImg();}
        //CDN 界面
        $id('wlp_img_cdn').onclick = function(){CDN.cdnUI();}
        //按钮退出
        $id('wlp_img_exit').onclick = function(){gallery.control.exitGallery();}
        //图像旋转按钮
        $id('wlp_img_right').onclick = function(){gallery.control.rotateRight();}
        $id('wlp_img_left').onclick = function(){gallery.control.rotateLeft();}
        //定位微博
        $id('wlp_img_scroll').onclick = function(){
            document.body.scrollTop = gallery.findParent().offsetTop - 50;
            document.documentElement.scrollTop = gallery.findParent().offsetTop - 50;
            gallery.control.exitGallery();
        }
        //帮助按钮
        $id('wlp_img_help').onclick = function(){
            alert('鼠标操作：\n\n缩放图片：在图片上滚动鼠标滚轮可以放大缩小图像。\n拖动图片：在图片上按住鼠标左键可以自由拖动图片。\n滚动图片：在空白区域滚动滚轮可以滚动图片。\n\n退出画廊模式：双击图片\n\n\n\n键盘操作：\n\n左右方向：切换图片。\n上下方向：滚动图片。\nZ、C：旋转图像。\nX：切换图像模式。\nV：定位到该微博。\n空格：1:1 与初始状态切换。\nB：新窗口查看大图\n\nESC：退出画廊模式。')
        }
        //缩放 1：1 按钮
        $id('wlp_img_ori').onclick = function(){
            gallery._view = false;
            gallery.calcPos(gallery.img.height, gallery.img.width, '');
        }

        gallery.mode.onclick = function(){gallery.control.changeMode();}
        //显示缩放比例和适合屏幕的按钮
        gallery.ratio.onclick = function(){
            gallery._view = true;
            gallery.calcPos(gallery.img.height, gallery.img.width, '');
        }
    },

    trans : {
        //读取和设置 transform
        getTrans : function(){
            if(_css){
                scale = parseFloat(gallery.img.parentNode.style.transform.replace(reg15, '$1'));
                rotate = parseInt(gallery.img.parentNode.style.transform.replace(reg16, '$1'));
            }else{
                scale = parseFloat(gallery.img.parentNode.style.webkitTransform.replace(reg15, '$1'));
                rotate = parseInt(gallery.img.parentNode.style.webkitTransform.replace(reg16, '$1'));
            }
            return [scale, rotate];
        },
        setTrans : function(scale, rotate){
            if(_css){
                gallery.img.parentNode.style.transform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
            }else{
                gallery.img.parentNode.style.webkitTransform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
            }
        }
    },

    control : {
    //复用函数
        //切换模式
        changeMode : function(){
            clearTimeout(it); //清除之前的定时
            gallery.noti.style.visibility = 'visible';
            gallery._view = __view;
            gallery.img.style.opacity = '0';
            it = setTimeout(function(){
                gallery.img.style.visibility = 'hidden'; //设置为隐藏，这样下方的控制栏就不会受未加载图像的影响而改变透明度。
                gallery.img.src = '';
                gallery.noti.visibility = "visible";
                gallery.noti.innerHTML = '正在读取';
                gallery._mode = gallery._mode === true ? false : true;
                if(gallery._mode){
                    gallery.mode.innerHTML = '大图(X)';
                    src = imgs[imgNum].src.replace(reg14, 'large');
                }else{
                    gallery.mode.innerHTML = '中图(X)';
                    src = imgs[imgNum].src.replace(reg14, 'bmiddle');
                }
                imgReady(src, function(){gallery.img.style.visibility = "visible";gallery.img.style.opacity = "0.5";gallery.calcPos(this.height, this.width, src)});
                save('mode', gallery._mode);
            }, 200);
        },
        //旋转图像
        rotateRight : function(){
            var trans = gallery.trans.getTrans();
            trans[1] = trans[1] + 90;
            if(trans[1] >= 360 || trans[1] <= -360){
                trans[1] = 0;
            }
            gallery.trans.setTrans(trans[0], trans[1]);
        },
        rotateLeft : function(){
            var trans = gallery.trans.getTrans();
            trans[1] = trans[1] - 90
            if(trans[1] >= 360 || trans[1] <= -360){
                trans[1] = 0;
            }
            gallery.trans.setTrans(trans[0], trans[1]);
        },
        //退出画廊
        exitGallery : function(){
            clearTimeout(it);
            it = setTimeout(function(){
                gallery.imgDiv.style.visibility = 'hidden';
                //置入一个 1X1 的 png 清空之前的图像
                gallery.img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACXZwQWcAAAABAAAAAQDHlV/tAAAAAnRSTlMA/1uRIrUAAAAKSURBVAjXY/gPAAEBAQAbtu5WAAAAAElFTkSuQmCC';
            }, 300);
            gallery._view = __view;
            gallery.imgDiv.style.opacity = '0';
            document.onkeydown = null;
        },
        //下一张
        nextImg : function(){
            clearTimeout(it);
            gallery.noti.style.visibility = 'visible';
            gallery._view = __view; //将浏览比例标志重置
            gallery.img.style.opacity = '0'; //先把图像透明，读取后再显示
            imgNum++;
            if(imgNum > imgs.length - 1 || imgNum < 0){
                imgNum = 0;//置零
            }
            //自动载入后面的图像
            if(imgNum == imgs.length - 4){
                try{
                    removeNodeInsertedListener(wlp_bind.Main_insert);
                }catch(err){}
                var currentPos = document.body.scrollTop;
                window.scrollTo(0,document.body.scrollHeight);
                wlp_bind.Main_insert = addNodeInsertedListener('div.WB_feed_datail, div.list_pic', function(){
                    imgs = document.querySelectorAll('img.bigcursor[src*="sinaimg"], .photoList img[src*="sinaimg"], img.photo_pic[src*="sinaimg"], .list_picbox .img img[src*="sinaimg"]');
                    gallery.counter_now.innerHTML = parseInt(imgNum) + 1;
                    gallery.counter_total.innerHTML = imgs.length;
                });
                setTimeout(function(){window.scrollTo(0,currentPos)}, 500);
            }
            gallery.counter_now.innerHTML = imgNum + 1;
            it = setTimeout(function(){
                gallery.img.style.visibility = 'hidden'; //设置为隐藏，这样下方的控制栏就不会受未加载图像的影响而改变透明度。
                gallery.img.src = '';
                gallery.noti.visibility = "visible";
                gallery.noti.innerHTML = '正在读取';
                gallery._mode ? src = imgs[imgNum].src.replace(reg14, 'large') : src = imgs[imgNum].src.replace(reg14, 'bmiddle'); //根据浏览模式决定大图小图
                gallery._cdn === 0 ? true : src = src.replace(/ww\d\./, 'ww' + gallery._cdn + '.'); //根据 CDN 设置地址
                gallery.source.href = src.replace('bmiddle', 'large');
                imgReady(src, function(){gallery.img.style.visibility = "visible";gallery.img.style.opacity = "0.5";gallery.calcPos(this.height, this.width, src)});
            }, 200);
        },
        //上一张
        prevImg : function(){
            clearTimeout(it);
            gallery._view = __view;
            gallery.noti.style.visibility = 'visible';
            gallery.img.style.opacity = '0';
            imgNum--;
            if(imgNum > imgs.length - 1 || imgNum < 0){
                imgNum = imgs.length - 1;
            }
            //自动载入后面的图像
            if(imgNum == imgs.length - 1){
                try{
                    removeNodeInsertedListener(wlp_bind.Main_insert);
                }catch(err){}
                var currentPos = document.body.scrollTop;
                window.scrollTo(0,document.body.scrollHeight);
                wlp_bind.Main_insert = addNodeInsertedListener('div.WB_feed_datail, div.list_pic', function(){
                    imgs = document.querySelectorAll('img.bigcursor[src*="sinaimg"], .photoList img[src*="sinaimg"], img.photo_pic[src*="sinaimg"], .list_picbox .img img[src*="sinaimg"]');
                    gallery.counter_now.innerHTML = parseInt(imgNum) + 1;
                    gallery.counter_total.innerHTML = imgs.length;
                });
                setTimeout(function(){window.scrollTo(0,currentPos)}, 500);
            }
            gallery.counter_now.innerHTML = imgNum + 1;
            it = setTimeout(function(){
                gallery.img.style.visibility = 'hidden'; //设置为隐藏，这样下方的控制栏就不会受未加载图像的影响而改变透明度。
                gallery.img.src = '';
                gallery.noti.visibility = "visible";
                gallery.noti.innerHTML = '正在读取';
                gallery._mode ? src = imgs[imgNum].src.replace(reg14, 'large') : src = imgs[imgNum].src.replace(reg14, 'bmiddle'); //根据浏览模式决定大图小图
                gallery._cdn === 0 ? true : src = src.replace(/ww\d\./, 'ww' + gallery._cdn + '.'); //根据 CDN 设置地址
                gallery.source.href = src.replace('bmiddle', 'large');
                imgReady(src, function(){gallery.img.style.visibility = "visible";gallery.img.style.opacity = "0.5";gallery.calcPos(this.height, this.width, src)});
            }, 200);
        },
    },

    //寻找父级节点
    findParent : function(){
        var node = imgs[imgNum].parentNode;
        for(var i = 0;i <= 9;i++){
            if(node.className.indexOf('WB_feed_datail') >= 0 || node.className.indexOf('list_feed_li') >= 0 || node.className.indexOf('MIB_linedot_l') >= 0 || node.className.indexOf('feed_list ') >= 0 || node.className.indexOf('list_picbox') >= 0 || node.className.indexOf('one_pic') >= 0 || node.className.indexOf('m_photoItem') >= 0){
                return node;
                break;
            }else{
                node = node.parentNode;
            }
        }
        return false;
    },

    //根据图像大小，计算图像位置和缩放程度
    calcPos : function(height, width, src){
        if(gallery._view === false){
            var trans = gallery.trans.getTrans();
            gallery.trans.setTrans('1', trans[1]);
            if(gallery.img.height > window.innerHeight * 0.8){
                gallery.img.parentNode.style.top = '40px'; //图像上边不超过屏幕，阅读长微博很合适
            }
            gallery.ratio.innerHTML = '1';
            gallery._view = true;
            return;
        }else{
            if(height > window.innerHeight * 0.8 && gallery._view === true){
                var imgHeightRatio = (window.innerHeight - 50) * 0.8 / height;
            }else{
                var imgHeightRatio = 1;
            }
            if(width > document.body.offsetWidth * 0.8 && gallery._view === true){
                var imgWidthRatio = document.body.offsetWidth * 0.8 / width;
            }else{
                var imgWidthRatio = 1;
            }
            var scale = Math.floor((imgHeightRatio || imgWidthRatio) * 100) / 100;
            gallery.trans.setTrans(scale, '0');
            gallery.img.parentNode.style.left = (document.body.offsetWidth - width) / 2 + 'px';
            gallery.img.parentNode.style.top = (window.innerHeight - 40 - height) / 2 + 'px';
            if(src !== ''){
                gallery.img.src = src;
            }
            gallery.ratio.innerHTML = scale;
            gallery._view = false;
        };
    },

    //图像拖曳
    dragF : {
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
                gallery.dragF.locked = true;
                $id(obj).style.position = 'absolute';
                gallery.dragF.lastObj = $id(obj);
                var tempX = $id(obj).offsetLeft;
                var tempY = $id(obj).offsetTop;
                gallery.dragF.x = e.clientX;
                gallery.dragF.y = e.clientY;
                document.onmousemove = function(e){
                    var e = e ? e :window.event;
                    if(gallery.dragF.locked == false){return false;}
                    $id(obj).style.left = tempX + e.clientX - gallery.dragF.x + 'px';
                    $id(obj).style.top = tempY + e.clientY - gallery.dragF.y + 'px';
                    if(window.event){
                        e.returnValue = false;
                    }
                };
                document.onmouseup = function(){
                    gallery.dragF.locked = false;
                };
            };
        }
    },
}

/* -测速- */
//建立选项界面
var CDN = {
    init : function(){
        //建立选项元素
        //CDN
        var option2 = document.createElement('li');
        option2.title = '新浪微博之我要看大图设置';
        option2.innerHTML = '<a href="javascript:;" id="wlp_cdn_btn">我要看大图设置</a>';


        //设置菜单 dom 建立时将选项添加到设置菜单
        var bindOption = addNodeInsertedListener('.gn_text_list li a', function(){
            document.getElementsByClassName('gn_text_list')[3].appendChild(option2);
            option2 = null;

            $id('wlp_cdn_btn').onclick = function(){CDN.cdnUI();}

            removeNodeInsertedListener(bindOption);
        });
    },

    cdnUI : function(){
        if(document.querySelectorAll('#wlp_cdn').length === 0){
            var div = document.createElement('div');
            div.id = 'wlp_cdn';
            div.innerHTML = '<div><h4>新浪微博之我要看大图 - 设置</h4><br/><hr><p>在这里可以强制指定新浪图片服务器的地址（只对画廊模式和图片源按钮有效）。通常情况新浪的图片服务器（ww*.sinaimg.cn）会根据你的地址和网络分配最合适的服务器和 CDN，但是有时新浪分配的服务器和 CDN 速度很慢，这时可以强制指定一个速度更快的服务器为你服务。</p><p>一般情况下建议使用“新浪分配”，仅在某些图片无法加载或加载很慢时才特别指定服务器，并选择“在此页面临时使用”。</p><p>以下数值单位为毫秒，最后一列为同一图片的三次测速平均值。超时记为 5000 毫秒。</p><p>1：<span id="wlp_cdn_1">-</span><span id="wlp_cdn_5">-</span><span id="wlp_cdn_9">-</span><span id="wlp_cdn_13">-</span></p><p>2：<span id="wlp_cdn_2">-</span><span id="wlp_cdn_6">-</span><span id="wlp_cdn_10">-</span><span id="wlp_cdn_14">-</span></p><p>3：<span id="wlp_cdn_3">-</span><span id="wlp_cdn_7">-</span><span id="wlp_cdn_11">-</span><span id="wlp_cdn_15">-</span></p><p>4：<span id="wlp_cdn_4">-</span><span id="wlp_cdn_8">-</span><span id="wlp_cdn_12">-</span><span id="wlp_cdn_16">-</span></p><p>服务器：<select name="wlp_cdn_option" id="wlp_cdn_option"><option value="0">新浪分配</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select><a id="wlp_cdn_test" name="wlp_cdn_test">测速</a><a id="wlp_cdn_temp" name="wlp_cdn_temp">在此页面临时使用</a><a id="wlp_cdn_save" name="wlp_cdn_save">一直使用</a></p><hr><p><label><input type="checkbox" id="wlp_view"> 画廊模式优先使用自动缩放图像</label></p><p><label><input type="checkbox" id="wlp_floatbar_option"> 启用图像浮动工具栏</label></p><hr><p><a href="http://xiaoxia.de/">我的博客</a><a href="http://goo.gl/jJM0c">反馈</a><a href="https://greasyfork.org/scripts/5038-weibo-larger-pics">GreasyFork</a><a style="color:red;font-weight:bold" href="http://xiaoxia.de/upload/donation.html">捐赠</a><a id="wlp_cdn_exit" style="float:right" name="wlp_cdn_exit">关闭</a></p></div>';
            document.body.appendChild(div);
            //根据设置确定显示
            $id('wlp_cdn_option').value = gallery._cdn;
            $id('wlp_view').checked = __view;
            $id('wlp_floatbar_option').checked = wlp_floatbar.status;
            //测试 CDN 速度
            $id('wlp_cdn_test').onclick = function(){CDN.cdnTest();}
            //此页临时保存
            $id('wlp_cdn_temp').onclick = function(){
                gallery._cdn = parseInt($id('wlp_cdn_option').value);
            }
            //永久保存
            $id('wlp_cdn_save').onclick = function(){
                gallery._cdn = parseInt($id('wlp_cdn_option').value);
                save('cdn', gallery._cdn);
            }
            //保存缩放图像设置
            $id('wlp_view').onchange = function(){
                gallery._view = __view = this.checked;
                save('view', __view);
            }
            //保存浮动工具栏设置
            $id('wlp_floatbar_option').onchange = function(){
                if(this.checked === false){
                    save('floatbar', false);
                    wlp_floatbar.remove();
                    wlp_floatbar.status = false;
                }else{
                    save('floatbar', true);
                    confirm('重新开启浮动栏需要刷新页面。\n\n点击“确定”立即刷新页面；\n点击“取消”那就待会儿再说~') === true ? window.location.reload() : true;
                }
            }
            //退出
            $id('wlp_cdn_exit').onclick = function(){$id('wlp_cdn').style.display = 'none';}
        }else{
            $id('wlp_cdn_option').value = gallery._cdn;
            $id('wlp_cdn').style.display = 'block';
        }
    },
    //测速
    cdnTest : function(){
        var nodes = $id('wlp_cdn').querySelectorAll('span');
        for(var z in nodes){
            nodes[z].innerHTML = '-';
        }
        var j = 0, n = 0, cdnt;
        var s = '.sinaimg.cn/large/74435927gw1e755qorypbj219x0uk4a8.jpg?';
        var cdnimg = document.createElement('img');
        var result = [];
        cdnimg.style.display = 'none';
        document.body.appendChild(cdnimg);
        start = new Date().getTime();
        cdnimg.onload = function(){
            clearTimeout(cdnt);
            end = new Date().getTime();
            n = j++ % 4 + 1;
            result.push(end - start);
            $id('wlp_cdn_' + j).innerHTML = end - start;
            start = end;
            // j >= 12 时计算平均加载时间并跳出
            if(j >= 12){
                $id('wlp_cdn_13').innerHTML = Math.round((result[0] + result[4] + result[8]) / 3);
                $id('wlp_cdn_14').innerHTML = Math.round((result[1] + result[5] + result[9]) / 3);
                $id('wlp_cdn_15').innerHTML = Math.round((result[2] + result[6] + result[10]) / 3);
                $id('wlp_cdn_16').innerHTML = Math.round((result[3] + result[7] + result[11]) / 3);
                document.body.removeChild(cdnimg); //删除测试节点
                return true;
            }
            cdnimg.src = 'http://ww' + n + s + start;
            //图片加载超时处理
            cdnt = window.setTimeout(function(){
                result[j] = 5000;
                n = j++ % 4 + 1;
                $id('wlp_cdn_' + j).innerHTML = '超时';
                cdnimg.src = 'http://ww' + n + s + start;
                start = new Date().getTime();
                clearTimeout(cdnt);
            }, 5000);
        }
        cdnimg.src = 'http://ww1' + s + start;
    },
}




/* -初始化- */
if(_on){
    //判断页面类型，主入口
    if(searchPic){
    //搜索页面
        bindSmall.searchPic();
    }else if(search){
    //搜索页面
        bindSmall.search();
    }else if(hot){
    //热门页面
        bindSmall.hot();
    }else if(media){
    //媒体版页面
        bindSmall.media();
    }else if(huati){
    //话题页面
        bindSmall.huati();
    }else if(photo){
    //照片页面
        bindSmall.photo();
    }
    bindSmall.main();
    bindSmall.photoTag();

    //初始化画廊
    gallery.init();
}

CDN.init();
})();