function renderCoin (id) {
  // 获取 canvas 元素和 2D 绘图上下文
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  // const devicePixelRatio = 1;
  // ctx.imageSmoothingEnabled = false;

  // 设置 canvas 的宽度和高度为窗口的宽度和高度
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  // 缩放画布上下文以匹配像素比
  ctx.scale(devicePixelRatio, devicePixelRatio);
  let lastTime = 0; // 记录上一帧的时间

  // 存储金币的数组
  const coins = [];
  // 金币的数量
  const coinCount = 200;

  // 金币图片
  const coinImage = new Image();
  coinImage.src = 'https://coding-demo-fullstack-serverless-vue-website-1300422826.cos.ap-guangzhou.myqcloud.com/public/images/2024-11-30-172499853004587_840_560-removebg-preview.png';

  // 创建一个金币对象
  function createCoin () {
    return {
      x: Math.random() * canvas.width, // 金币的 x 坐标
      y: (Math.random() * canvas.height - canvas.height), // 金币的 y 坐标，从顶部开始
      speedX: (Math.random() * 10 - 5), // 金币的水平速度
      speedY: (Math.random() * 100 + 100), // 金币的垂直速度，更快
      rotation: 0, // 金币的旋转角度
      width: 60,
      acceleration: Math.random() * 50, // 垂直加速度
      height: 40,
      rotationSpeed: Math.random() * 1.2 + 0.2 // 金币的旋转速度
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
      ctx.drawImage(coinImage, -coin.width / 2, -coin.height / 2, coin.width, coin.height); // 绘制金币，缩小一半
      ctx.restore(); // 恢复之前的绘图状态
    }
  }

  // 更新金币的位置和旋转角度
  function updateCoins (deltaTime = 0) {
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      coin.x += coin.speedX * deltaTime;
      coin.y += coin.speedY * deltaTime;
      coin.rotation += coin.rotationSpeed * deltaTime;

      // 加速金币
      coin.speedY += coin.acceleration * deltaTime; // 增加垂直速度

      // 如果金币超出画布底部，则重新生成一个新的金币
      if (coin.y > canvas.height) {
        coins[i] = createCoin();
      }
    }
  }

  // 动画循环
  function animate (currentTime = 0) {
    const deltaTime = (currentTime - lastTime) / 1000; // 计算时间差，单位为秒
    lastTime = currentTime;

    drawCoins(); // 绘制金币
    updateCoins(deltaTime); // 更新金币位置和旋转角度
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
    // 缩放画布上下文以匹配像素比
    ctx.scale(devicePixelRatio, devicePixelRatio);
  });
}