function renderSnow (id) {
  // 获取 canvas 元素和 2D 绘图上下文
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');

  // 设置 canvas 的宽度和高度为窗口的宽度和高度
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 存储雪花的数组
  const snowflakes = [];
  // 雪花的数量
  const snowflakeCount = 200;

  // 创建一个雪花对象
  function createSnowflake () {
    return {
      x: Math.random() * canvas.width, // 雪花的 x 坐标
      y: Math.random() * canvas.height - canvas.height, // 雪花的 y 坐标，从顶部开始
      radius: Math.random() * 2 + 1, // 雪花的半径
      speedX: Math.random() * 1 - 0.5, // 雪花的水平速度
      speedY: Math.random() * 2 + 1, // 雪花的垂直速度
      opacity: Math.random() * 0.3 + 0.7 // 雪花的透明度
    };
  }

  // 初始化雪花数组
  function initSnowflakes () {
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push(createSnowflake());
    }
  }

  // 绘制所有雪花
  function drawSnowflakes () {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    // ctx.fillStyle = 'white';
    // ctx.fillStyle = 'black';
    ctx.beginPath();
    for (let i = 0; i < snowflakes.length; i++) {
      const snowflake = snowflakes[i];
      ctx.globalAlpha = snowflake.opacity; // 设置透明度
      ctx.moveTo(snowflake.x, snowflake.y);
      ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalAlpha = 1; // 重置透明度
  }

  // 更新雪花的位置
  function updateSnowflakes () {
    for (let i = 0; i < snowflakes.length; i++) {
      const snowflake = snowflakes[i];
      snowflake.x += snowflake.speedX;
      snowflake.y += snowflake.speedY;

      // 如果雪花超出画布底部，则重新生成一个新的雪花
      if (snowflake.y > canvas.height) {
        snowflakes[i] = createSnowflake();
      }
    }
  }

  // 动画循环
  function animate () {
    drawSnowflakes(); // 绘制雪花
    updateSnowflakes(); // 更新雪花位置
    requestAnimationFrame(animate); // 请求下一帧动画
  }

  // 初始化雪花
  initSnowflakes();
  // 开始动画
  animate();

  // 监听窗口大小调整事件，动态调整 canvas 的宽度和高度
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}