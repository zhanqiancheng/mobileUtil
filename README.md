# mobileUtil
##帮助更好的适配移动端页面
###使用说明
####index.html里头部js有两种处理方式
####1.rem
不用写 meta 标签，该方法根据 dpr 自动生成meta viewport标签，并在 html 标签中加上 `data-dpr` 和 `font-size` 两个属性值。
####2.定宽
头部定义标签`<meta name="viewport" content="target-densitydpi=device-dpi,width=750">`，该方法会获取width，并自动计算scale值设置缩放
####px2rem
#####如果使用rem做适配，则任何弹性尺寸均使用 rem 作为单位
当前方案会把这3类视觉稿分成`100份`来看待。每一份被称为一个单位a。同时，1rem单位认定为10a。拿750的视觉稿举例：
``` html
1a = 7.5px
1rem = 75px // 基准值
```
对于视觉稿上的元素的尺寸换算，只需要`原始px值`除以`rem基准px值`即可, 例如`240px * 120px(240/75 * 120/75)`的元素，最后转换为`3.2rem * 1.6rem`。
``` scss
$ppr: 750px / 10 / 1rem;
/*
写法
div{
	width: 240px / $ppr;
	height: 120px / $ppr;
}
*/
```
#####字体、背景图定位都不使用rem
字体和背景图定位不推荐使用rem作为单位，依旧使用px作为单位，配合使用`data-dpr`属性来区分不同`dpr`下的大小（_rem.scss）已提供处理方法
``` scss
/**
 * @description 在不同dpr下设置对应的px
 * @param {String} $name - 属性名
 * @param {number} $px - 设计稿元素尺寸
 * @include px2px(font-size, 24);
 */
@mixin px2px($name, $px){
    #{$name}: round($px / 2) * 1;
    [data-dpr="2"] &{
        #{$name}: $px * 1;
    }
    [data-dpr="3"] &{
        #{$name}: round($px / 2 * 3) * 1;
    }
}

a{
	@include px2px(font-size, 24);
}
```
生成
``` css
a{
	font-size: 12px;
}
[data-dpr="2"] a{
	font-size: 24px;
}
[data-dpr="3"] a{
	font-size: 36px;
}
```
#####sprite图定位处理
sprite图合并基于compass
相关代码可看_sprite.scss