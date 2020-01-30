/**
 * 万魔wm模板引擎v1.0
 * [盟东阳]
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        // es6 module , typescript
        var mo = factory();
        mo.__esModule = true;
        mo['default'] = mo;
        module.exports = mo;

    } else {
        // browser
        root.wmtpl = factory();
    }
}(this, function () {
    // 兼容ie6以上console.log
    window.console = window.console || (function(){  
        var c = {};   
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};  
        return c;  
    })();  
    /**
     * [render 模板 + 数据 => 渲染后的字符串]
     * @param  {[string]} content [原始文本与js]
     * @param  {[任意类型]} data    [赋值数据]
     * @param  {[arr]} config [配置信息]
     */
    function render(content, data,config) {
        // 判断config参数是否被传入进来
        if (config==undefined||config==''||arguments.length!=3) {
            config = {
                left_tpl_str:'{{'//左边替换字符串
                ,right_tpl_str:'}}'//右边替换字符串
                ,placeholder:'#'//显示变量的占位符
                ,data_name:'data'//数据传入的变量名称
                ,tpl_debug:false//调试模式
                ,debug_error_message:"页面错误！"//错误信息，tpl_debug:false时生效
            };
        }
        data = data || {};
        var list = ['var newtpl = "";'];
        var codearray = getinitialdata(content,config);  // 代码分割项数组
        // 检测是否匹配到js逻辑文本
        if (codearray==false) {
            if (config.tpl_debug===true) {
                return '预编译失败：左边或右边匹配符错误，未匹配到内容！';
            }else{
                return config.debug_error_message;
            }
        }
        for (var i = 0, len = codearray.length; i < len; i++) {
            var things = codearray[i]; // 当前分割项
            if (things.type == 1) {  // js逻辑
                list.push(things.txt);
            }
            else if (things.type == 2) {  // js占位
                var txt = 'newtpl+=' + things.txt + ';';
                list.push(txt);
            }
            else {  //文本
                var txt = 'newtpl+="' +
                    things.txt.replace(/"/g, '\\"') +
                    '";';
                list.push(txt);
            }
        }
        list.push('return newtpl;');
        try {
            return new Function(config.data_name, list.join('\n'))(data);
        }catch(err){
            if (config.tpl_debug===true) {
                return '预编译失败。'+err;
            }else{
                return config.debug_error_message;
            }
        }
    }
    /**
     * [getinitialdata 提取原始模板数据中的js与文本部分]
     * @param  {[string]} content [原始文本与js]
     * @param  {[arr]} config [配置信息]
     */
    function getinitialdata(content,config) {
        var arr = [];                 //返回的数组，用于保存匹配结果
        // /{{([\s\S]*?)}}/g 用于匹配js代码的正则
        var reg = new RegExp(config.left_tpl_str+"([\\s\\S]*?)"+config.right_tpl_str,"g");
        var match;                    //当前匹配到的match
        var nowIndex = 0;             //当前匹配到的索引 
        var placeholder=config.placeholder;          //匹配占位符(显示)
        // var placeholder='#';          //匹配占位符(显示)
        while (match = reg.exec(content)) {
            // 保存当前匹配项之前的普通文本/占位
            addtextarray(arr, content.substring(nowIndex, match.index));
            //保存当前匹配项
            var things = {
                type: 1,      // 类型  1- js逻辑 2- js 占位 null- 文本
                txt: match[1] // 内容
            };
            if (match[1].substr(0,1) == placeholder) {  // 如果是js占位
                things.type = 2;
                things.txt = things.txt.substr(1);
            }
            arr.push(things);
            //更新当前匹配索引
            nowIndex = match.index + match[0].length;
        }
        if (arr==null||arr=='') {
            return false;
        }
        //保存文本尾部
        addtextarray(arr, content.substr(nowIndex));
        return arr;
    }
    /**
     * [
     * addtextarray 普通文本添加到数组，
     * 对换行部分进行转义
     * ]
     * @param {[array]} list [type:number,txt:string]
     * @param {[string]} content [字符文本]
     */
    function addtextarray(list, content) {
        content = content.replace(/\r?\n/g, "\\n");
        list.push({ txt: content });
    }
    return render;
}));