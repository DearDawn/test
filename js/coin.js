function renderCoin (id) {
  // 获取 canvas 元素和 2D 绘图上下文
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  // ctx.imageSmoothingEnabled = false;

  // 设置 canvas 的宽度和高度为窗口的宽度和高度
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

  // 存储金币的数组
  const coins = [];
  // 金币的数量
  const coinCount = 150;

  // 金币图片
  const coinImage = new Image();
  coinImage.src = 'https://coding-demo-fullstack-serverless-vue-website-1300422826.cos.ap-guangzhou.myqcloud.com/public/images/2024-11-30-172499853004587_840_560-removebg-preview.png';

  // 创建一个金币对象
  function createCoin () {
    return {
      x: Math.random() * canvas.width, // 金币的 x 坐标
      y: Math.random() * canvas.height - canvas.height, // 金币的 y 坐标，从顶部开始
      speedX: (Math.random() * 1 - 0.5) * devicePixelRatio, // 金币的水平速度
      speedY: (Math.random() * 2 + 2) * devicePixelRatio, // 金币的垂直速度，更快
      rotation: 0, // 金币的旋转角度
      scale: devicePixelRatio,
      rotationSpeed: Math.random() * 0.2 // 金币的旋转速度
    };
  }

  // 初始化金币数组
  function initCoins () {
    for (let i = 0; i < coinCount; i++) {
      coins.push(createCoin());
    }
  }

  // 绘制所有金币
  function drawCoins () {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      ctx.save(); // 保存当前绘图状态
      ctx.translate(coin.x, coin.y); // 移动到金币的中心点
      ctx.rotate(coin.rotation); // 旋转
      ctx.drawImage(coinImage, -coinImage.width / coin.scale / 2, -coinImage.height / coin.scale / 2, coinImage.width / coin.scale, coinImage.height / coin.scale); // 绘制金币，缩小一半
      ctx.restore(); // 恢复之前的绘图状态
    }
  }

  // 更新金币的位置和旋转角度
  function updateCoins () {
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      coin.x += coin.speedX;
      coin.y += coin.speedY;
      coin.rotation += coin.rotationSpeed;

      // 如果金币超出画布底部，则重新生成一个新的金币
      if (coin.y > canvas.height) {
        coins[i] = createCoin();
      }
    }
  }

  // 动画循环
  function animate () {
    drawCoins(); // 绘制金币
    updateCoins(); // 更新金币位置和旋转角度
    requestAnimationFrame(animate); // 请求下一帧动画
  }

  // 初始化金币
  initCoins();
  // 开始动画
  animate();

  // 监听窗口大小调整事件，动态调整 canvas 的宽度和高度
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
  });
}