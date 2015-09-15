# mobileUtil
##帮助更好的适配移动端页面
###使用说明
####index.html里头部js有两种处理方式
####1.rem
不用写 meta 标签，该方法根据 dpr 自动生成meta viewport标签，并在 html 标签中加上 `data-dpr` 和 `font-size` 两个属性值（[手淘自适应方案](https://github.com/amfe/lib-flexible)）
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
#####字体不使用rem
字体不推荐使用rem作为单位，依旧使用px作为单位，配合使用`data-dpr`属性来区分不同`dpr`下的大小（_rem.scss）已提供处理方法
``` sass
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


之前尝试background-position用rem会出现定位错位情况，所以之后还是用回px去设置sprite图的background-position，和设置字体一样，根据data-dpr去设置不同dpr下的位置，核心代码如下：
``` scss
%getIconsPath{
	display: block;
	background-image: sprite-url($icons);
	background-repeat: no-repeat;
	background-position-y: 0;
	@include px2px(background-size, floor(image-width(sprite-path($icons))));
}
/**
 * @description 在不同dpr下设置对应的px（适用于同时设置多个属性）
 * @param {object} $maps - 属性名
 * @param {number} $dpr - 设置支持的最高像素比，默认为3
 * @include pxs2px($maps: (
        width: 200px,
        height: 200px
    ));
 */
@mixin pxs2px($maps, $dpr : 3){
    @for $i from 1 through $dpr {
        $multiple: 1;
        $num: 1;
        @if $i == 1 {
            $num: 2;
            @each $type, $val in $maps{
                #{$type}: ceil($val / $num) * $multiple;
            }
        }@else{
            $multiple: $multiple * $i;
            $num: 2;
            [data-dpr="#{$i}"] &{
                @each $type, $val in $maps{
                    #{$type}: ceil($val / $num) * $multiple;
                }
            }
        }
        
    }
}
@mixin getIcon($iconName, $active: false){
	$posX: ceil(nth(sprite-position($icons, $iconName), 1));
	$w: image-width(sprite-file($icons, $iconName));
	$h: image-height(sprite-file($icons, $iconName));
	$map: (
		width: $w,
		height: $h,
		background-position-x: $posX
	);
	@if $active == true{
		$map: (
			background-position-x: $posX
		);
	}
	@include pxs2px($maps: $map);
	@extend %getIconsPath;
}
```
生成的css代码大概如下
``` css
a {
  display: block;
  width: 28px;
  height: 28px;
  background-image: url('../img/icons-s1fc22bf1d4.png');
  background-repeat: no-repeat;
  background-position-y: 0;
  background-position-x: -575px;
  background-size: 2053px;
}
[data-dpr="2"] a {
  width: 56px;
  height: 56px;
  background-size: 4106px;
  background-position-x: -1150px;
}
[data-dpr="3"] a {
  width: 84px;
  height: 84px;
  background-position-x: -1725px;
  background-size: 6159px;
}
```
这种方法有缺陷，我们用rem布局的初衷就是想做自适应，用px的话虽然不会有错位问题，但没法做自适应，而且编译后的代码量太大，要是图标多的话生成的css文件大小简直惊人。



那么就没办法了么，别忘记background-position还可以根据百分比定位，原理可看[闲扯 background-position 的单位属性值](http://linxz.github.io/blog/css%E5%B1%9E%E6%80%A7%E5%9F%BA%E7%A1%80/2015/09/talk-about-background-position-values.html)



sass
``` sass
%getIconsPath{
	display: block;
	background-image: sprite-url($icons);
	background-repeat: no-repeat;
	background-position-y: 0;
	background-size: floor(image-width(sprite-path($icons)) / $ppr);
}
@mixin getIcon($iconName){
	$width: image-width(sprite-path($icons));
	$iconWidth: image-width(sprite-file($icons, $iconName));
	$iconHeight: image-height(sprite-file($icons, $iconName));
	$posX: nth(sprite-position($icons, $iconName), 1);
	width: $iconWidth / $ppr;
	height: $iconHeight / $ppr;
	@if $posX != 0{
		background-position-x: $posX / ($iconWidth - $width) * 100%;
	} @else{
		background-position-x: 0;
	}
	@extend %getIconsPath;
}
```
生成的css大概如下
``` css
a, p {
    display:block;
    background-image: url('../img/icons-s1fc22bf1d4.png');
    background-repeat: no-repeat;
    background-position-y: 0;
    background-size: 54rem;
}
a {
    width: 0.73333rem;
    height: 0.73333rem;
    background-position-x: 28.41274%;
}
```
这里将雪碧图设置成横排，这样就只需要计算x轴的百分比，y轴为0。图片的background-size还是用rem，不管去适应哪些屏幕，因为定位是百分比的所以不会出现错位问题。目前改方法只是demo在部分机型测试通过，还未用于实际项目。