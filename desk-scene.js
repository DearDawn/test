
export class Camera {
  constructor (scene) {
    this.scene = scene;
    this.bigMode = false;
    this.isDragging = false;
    this.previousX = 0;
    this.previousY = 0;
    this.rotationX = 75;
    this.rotationZ = 0;
    this.previousRotationZ = 0;
    this.scale = 1;
    this.initialDistance = 0;
    this.initialScale = 1;

    this.sceneDom = scene.dom;
    this.sceneRect = this.sceneDom.getBoundingClientRect();

    this.setScene({ x: 0, y: 0, rx: this.rotationX, rz: this.rotationZ, s: this.scale });
  }

  setScene ({ x, y, rx, rz = 0, s, d = 0.5 }) {
    this.sceneDom.style.setProperty('--offset-x', `${x}px`);
    this.sceneDom.style.setProperty('--offset-y', `${y}px`);
    this.sceneDom.style.setProperty('--rotate-x', `${rx}deg`);
    this.sceneDom.style.setProperty('--rotate-z', `${rz}deg`);
    this.sceneDom.style.setProperty('--scale', s);
    this.sceneDom.style.transitionDuration = `${d}s`;
    this.rotationZ = rz;
  }

  reset () {
    this.setScene({ x: 0, y: 0, rx: this.rotationX, s: 1, rz: this.previousRotationZ });
    this.bigMode = false;
  }

  focus (x, y, z) {
    this.previousRotationZ = this.rotationZ;
    this.setScene({ x: -x, y: -y, rx: 0, s: 2 });
    this.bigMode = true;
  }

  startDrag (event) {
    this.isDragging = true;
    this.previousX = event.clientX;
    this.previousY = event.clientY;
  }

  drag (event) {
    if (!this.isDragging || this.bigMode) return;

    const deltaX = event.clientX - this.previousX;
    const deltaY = event.clientY - this.previousY;

    this.rotationZ -= deltaX * 0.5;
    this.rotationX = Math.min(Math.max(0, this.rotationX - deltaY * 0.5), 180);

    this.setScene({ x: 0, y: 0, rx: this.rotationX, rz: this.rotationZ, s: this.scale, d: 0 });

    this.previousX = event.clientX;
    this.previousY = event.clientY;
  }

  endDrag () {
    this.isDragging = false;
  }

  zoom (event) {
    event.preventDefault();

    const delta = event.deltaY;
    this.scale *= 1 + delta * 0.001;
    this.scale = Math.min(Math.max(0.5, this.scale), 5);

    this.setScene({ x: 0, y: 0, rx: this.rotationX, rz: this.rotationZ, s: this.scale, d: 0 });
  }

  startTouch (event) {
    if (event.touches.length > 1) {
      this.initialDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      this.initialScale = this.scale;
    }

    this.isDragging = true;
    this.previousX = event.touches[0].clientX;
    this.previousY = event.touches[0].clientY;
  }

  touchMove (event) {
    if (!this.isDragging || this.bigMode) return;

    const deltaX = event.touches[0].clientX - this.previousX;
    const deltaY = event.touches[0].clientY - this.previousY;

    this.rotationZ -= deltaX * 0.5;
    this.rotationX = Math.min(Math.max(0, this.rotationX - deltaY * 0.5), 180);

    this.setScene({ x: 0, y: 0, rx: this.rotationX, rz: this.rotationZ, s: this.scale, d: 0 });

    this.previousX = event.touches[0].clientX;
    this.previousY = event.touches[0].clientY;

    if (event.touches.length === 2) {
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      this.scale = this.initialScale * (currentDistance / this.initialDistance);
      this.scale = Math.min(Math.max(0.5, this.scale), 2);

      this.setScene({ x: 0, y: 0, rx: this.rotationX, rz: this.rotationZ, s: this.scale, d: 0 });
    }
  }

  endTouch () {
    this.isDragging = false;
  }
}

export class Scene {
  constructor (dom) {
    this.dom = dom;
    this.camera = new Camera(this);
    this.models = [];
    this.initEventListeners();
  }

  append (model) {
    this.models.push(model);
    this.dom.appendChild(model.dom);
  }

  showAxis () {
    const axisX = document.createElement('div');
    const axisY = document.createElement('div');
    const axisZ = document.createElement('div');
    axisX.classList.add('axisX');
    axisY.classList.add('axisY');
    axisZ.classList.add('axisZ');
    this.dom.appendChild(axisX);
    this.dom.appendChild(axisY);
    this.dom.appendChild(axisZ);
  }

  showPlain () {
    const plainX = document.createElement('div');
    const plainY = document.createElement('div');
    const plainZ = document.createElement('div');
    plainX.classList.add('plainX');
    plainY.classList.add('plainY');
    plainZ.classList.add('plainZ');
    this.dom.appendChild(plainX);
    this.dom.appendChild(plainY);
    this.dom.appendChild(plainZ);
  }

  initEventListeners () {
    this.dom.addEventListener('click', () => {
      if (!this.camera.bigMode) return;
      this.camera.reset();
    });

    document.addEventListener('mousedown', (event) => {
      this.camera.startDrag(event);
    });

    document.addEventListener('mousemove', (event) => {
      this.camera.drag(event);
    });

    document.addEventListener('mouseup', () => {
      this.camera.endDrag();
    });

    this.dom.addEventListener('wheel', (event) => {
      this.camera.zoom(event);
    });

    document.addEventListener('touchstart', (event) => {
      this.camera.startTouch(event);
    });

    document.addEventListener('touchmove', (event) => {
      this.camera.touchMove(event);
    });

    document.addEventListener('touchend', () => {
      this.camera.endTouch();
    });
  }
}
