function renderCoinMountain (id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');

  let width = window.innerWidth * devicePixelRatio;
  let height = window.innerHeight * devicePixelRatio;
  // 设置画布的宽度和高度
  canvas.width = width;
  canvas.height = height;

  // 加载金币图片
  const coinImage = new Image();
  coinImage.src = 'https://coding-demo-fullstack-serverless-vue-website-1300422826.cos.ap-guangzhou.myqcloud.com/public/images/2024-11-30-%E2%80%94Pngtree%E2%80%94illustration%20gold%20coin_6667613.png';

  const render = () => {
    // 绘制金币堆
    const coinWidth = 40 * devicePixelRatio;
    const coinHeight = 40 * devicePixelRatio;
    const pileHeight = 200 * devicePixelRatio; // 金币堆的高度

    // 计算金币堆的中心位置
    const centerX = width / 2;
    const centerY = height - pileHeight;

    // 随机偏移量
    const randomOffset = (maxOffset) => Math.random() * maxOffset - maxOffset / 2;

    // 绘制金币堆
    let rowCoins = 3;
    for (let y = 0; y < pileHeight; y += coinHeight / 5) {
      const rowWidth = rowCoins * coinWidth * 1.5;
      const startX = centerX - rowWidth / 2;
      for (let x = 0; x < rowWidth; x += coinWidth / 2) {
        const offsetX = randomOffset(coinWidth / 4);
        const offsetY = randomOffset(coinHeight / 4);
        ctx.drawImage(coinImage, startX + x + offsetX, centerY + y + offsetY, coinWidth, coinHeight);
      }
      rowCoins++;
    }
  };

  coinImage.onload = render;

  // 监听窗口大小调整事件，动态调整 canvas 的宽度和高度
  window.addEventListener('resize', () => {
    width = window.innerWidth * devicePixelRatio;
    height = window.innerHeight * devicePixelRatio;
    // 设置画布的宽度和高度
    canvas.width = width;
    canvas.height = height;
    render();
  });
}