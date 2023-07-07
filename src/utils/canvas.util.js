/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-06 17:14:58
 * @LastEditTime: 2023-06-06 19:13:51
 */
export function drawFeaturePoint(face, ctx){
    (face.keypoints || []).forEach((point, index) => {
        // 上右眼
        if(index === 159){
            drawArc(ctx, point, 'yellow');
        }

        // 下右眼
        if(index === 144){
            drawArc(ctx, point, 'yellow');
        }

        // 上嘴唇
        if(index === 0){
            drawArc(ctx, point);
        }

        // 下嘴唇
        if(index === 17){
            drawArc(ctx, point);
        }

        // 面部最上方 额头
        if(index === 10){
            drawArc(ctx, point);
        }

        // 面部最下方 下巴
        if(index === 152){
            // console.log(point)
            drawArc(ctx, point);
        }

        // 上左眼
        if(index === 385){
            drawArc(ctx, point);
        }

        // 下左眼
        if(index === 374){
            drawArc(ctx, point);
        }

        // 中心点
        if(index === 195){
            // console.log(point);
            drawArc(ctx, point, '#fff', 3);
        }

        // 右脸颊边缘
        if(index === 93){
            // console.log(point);
            drawArc(ctx, point, '#fff');
        }

        // 左脸颊边缘
        if(index === 323){
            drawArc(ctx, point, '#fff');
        }
    });
}

function drawArc(ctx, point, style, r = 2, center = 0, radian = 2 * Math.PI){
    ctx.beginPath();
    ctx.fillStyle = style || 'red';
    ctx.arc(point.x, point.y, r, center, radian);
    ctx.fill();
}