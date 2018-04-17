/*
 * @Author: zy9@github.com/zy410419243 
 * @Date: 2018-04-05 10:53:03 
 * @Last Modified by: zy9
 * @Last Modified time: 2018-04-17 17:03:06
 */
require.config({
    paths:{
        'three': './third/three/three_r91',
        'mtl-loader': './third/three/loaders/MTLLoader',
        'obj-loader': './third/three/loaders/OBJLoader',
        'orbitControls': './third/three/controls/OrbitControls',
        'tween': './third/tween/Tween',
        'deepClone': './util/DeepClone',
        'trunk': './core/Trunk'
    },
})

require(['three', 'trunk'], function(THREE, Trunk) {
    var Trunk = new Trunk();
    Trunk.init({
        container: document.getElementById('container'), // 画布挂载节点
        // clear_color: 0x4584b4, // 画布颜色
        // clear_opacity: 0.5, // 画布透明度
        before_init: before_init,
        // mesh_shift_time: function() { // 定义各板块移动速度
        //     var duration = 1000;

        //     return Math.random() * duration * 5 + duration;
        // },
        border_visible: true, // 边界是否显示
        divisor: 12000, // 控制柱子高度，该数越大，柱子越矮
        texture: {
            line: '#045AAF', // 内部乡镇边界贴图
            pillar: '#1E8FF7', // 柱子贴图
            top: '#303471', // 上表面贴图
            bottom: '#000', // 底部贴图
            border: '#EBC9AE', // 边缘边界贴图
            select: '#071C5B', // 鼠标移入时贴图
        },
        child_mapping: child_mapping, // 手动设置实体贴图及其他，可以理解为遍历模型数据时的回调。该方法存在时，texture中只有select和top会生效
        light: initLight,
        set_material: function(materials) {
            var info = materials.materialsInfo;
            for(var key in info) {
                var value = info[key];

                // 初始化等值面
                if(key == 'texture') {
                    value.map_d = value.map_ka = value.map_kd = '../data/images/20180413180000_20180416180000.png';
                }
            }
            
            return materials;
        },
        data: {
            materials: ['./data/model/deqing05.mtl'],
            objects: ['./data/model/deqing05.obj'],
            business: './data/simulation.json',
            business_callback: function(result, object) { // 处理业务数据和模型数据，使板块和表格数据对应
                for(var i = 0; i < result.length; i++) {
                    var item = result[i];
        
                    for(var j = 0; j < object.children.length; j++) {
                        var jtem = object.children[j];
        
                        if(item.stcd == jtem.name.split('_')[0]) {
                            /* 
                                这个userData很关键，
                                点击板块时直接读取模型对象中userData的数据生成表格（如果需要），默认为空
                            */
                            jtem.userData = item;
                        }
                    }
                }
            },
        },
        show_detail: function(child) { // 这方法主要是把点击的模型传出来，具体要做什么自己写
            var detail = document.getElementById('detail');

            // 当点到边界或者柱子的时候不移动模型
            if(Object.getOwnPropertyNames(child.userData).length != 0) {
                if (detail.children.length != 0) {
                    /* 
                        这里图省事就直接清空原先的children建新表了
                        实际上该去修改innerHTML，会省很多性能
                    */
                for(var i = 0; i < detail.children.length; i++) {
                    detail.removeChild(detail.children[i]);
                }
                    createTable(child, detail);
                }else {
                    // 如果表格不存在，创建
                    createTable(child, detail);
                }
                return true;
            }

            return false;
        },
        controls: { // 轨道控制参数
            enableDamping: true, // 使动画循环使用时阻尼或自转，意思是否有惯性
            enableZoom: true, // 是否可以缩放
            enabled: true, // 是否启用轨道控制
        }
    });

    var timeline = document.getElementById('timeline');
    timeline.addEventListener('click', function() {
        Trunk.show_texture({ transparent: true, opacity: 0.5 }, './data/images/20180404100000_20180416100000.png');
    }, false);

    // 创建表格元素
    function createTable(child, element) {
        var data = Object.assign({ stnm: '-', val: '-' }, child.userData);
        var table = '', decorate = '';

        table += 
        '<table border="0" cellspacing="0" cellpadding="0" class="detail-table">' +
            '<tr class="header"> ' + 
                '<td colspan="3"></td>' + 
                '<td colspan="2">' + data.stnm + '</td>' +
            '</tr>'+

            '<tr>' + 
                '<td colspan="5"></td>' + 
            '</tr>' + 

            '<tr>' + 
                '<td class="title" colspan="3">' + '水位' + '</td>' +
                '<td class="value" colspan="2">' + data.val + '</td>' +
            '</tr>' +

            '<tr>' + 
                '<td colspan="5"></td>' + 
            '</tr>' +
        '</table>';

        decorate += '<div class="decorate"></div>'

        element.innerHTML += table + decorate;
    };

    /**
     * 初始化光线
     * x轴正方向是屏幕右边，y轴正方向是屏幕里边，z轴正方向是屏幕上边
     */
    function initLight() {
        var lights = [];

        var ambientLight = new THREE.AmbientLight('white');
        lights.push(ambientLight)

        return lights;
    }

    /**
     * 遍历所有模型对象时的回调 
     * @param {*} child 当前遍历模型
     */
    function child_mapping(child) {
        if(child instanceof THREE.Mesh || child instanceof THREE.Line) {
            var name = child.name.split('_');
            var last_name = name[name.length - 1];

            var texture = {
                line: '#045AAF', // 内部乡镇边界贴图
                pillar: '#FFF', // 柱子贴图
                top: '#303471', // 上表面贴图
                bottom: '#000', // 底部贴图
                border: '#F96', // 边缘边界贴图
                select: '#071C5B', // 鼠标移入时贴图
            };

            // 改变模型贴图
            switch(last_name) {
                case 'line': // 内部乡镇边界贴图
                    child.material.color.set(texture.line);
                break;

                case 'pillar': // 柱子贴图
                    child.material.map = new THREE.TextureLoader().load('./assets/texture/crate.jpg');
                    child.material.color.set(texture.pillar);
                break;

                case 'border': // 边缘边界贴图
                    child.material.color.set(texture.border);
                break;

                case 'texture': // 等值面
                    child.visible = false;
                break;

                default: // 顶面贴图
                    child.material.color.set(texture.top);
                    child.material.transparent = true;
                    child.material.opacity = 0.4;
                break;
            }
        }
    }
    
    function before_init(config) { // 初始化前的钩子
        
    }
});