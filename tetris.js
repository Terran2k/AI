// 俄罗斯方块游戏

// 游戏常量
const COLS = 10;           // 游戏面板列数
const ROWS = 20;           // 游戏面板行数
const BLOCK_SIZE = 30;     // 方块大小(像素)
const COLORS = [
    'transparent',  // 空白区域
    '#FF0D72',      // Z形方块 - 红色
    '#0DC2FF',      // I形方块 - 青色
    '#0DFF72',      // S形方块 - 绿色
    '#F538FF',      // T形方块 - 紫色
    '#FF8E0D',      // L形方块 - 橙色
    '#FFE138',      // O形方块 - 黄色
    '#3877FF'       // J形方块 - 蓝色
];

// 方块形状定义 (每种方块的4种旋转状态)
const SHAPES = [
    // 空
    [[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]],
    // Z形方块
    [
        [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
        [[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]],
        [[0,1,0,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]
    ],
    // I形方块
    [
        [[0,0,0,0],[2,2,2,2],[0,0,0,0],[0,0,0,0]],
        [[0,0,2,0],[0,0,2,0],[0,0,2,0],[0,0,2,0]],
        [[0,0,0,0],[0,0,0,0],[2,2,2,2],[0,0,0,0]],
        [[0,2,0,0],[0,2,0,0],[0,2,0,0],[0,2,0,0]]
    ],
    // S形方块
    [
        [[0,3,3,0],[3,3,0,0],[0,0,0,0],[0,0,0,0]],
        [[0,3,0,0],[0,3,3,0],[0,0,3,0],[0,0,0,0]],
        [[0,0,0,0],[0,3,3,0],[3,3,0,0],[0,0,0,0]],
        [[3,0,0,0],[3,3,0,0],[0,3,0,0],[0,0,0,0]]
    ],
    // T形方块
    [
        [[0,4,0,0],[4,4,4,0],[0,0,0,0],[0,0,0,0]],
        [[0,4,0,0],[0,4,4,0],[0,4,0,0],[0,0,0,0]],
        [[0,0,0,0],[4,4,4,0],[0,4,0,0],[0,0,0,0]],
        [[0,4,0,0],[4,4,0,0],[0,4,0,0],[0,0,0,0]]
    ],
    // L形方块
    [
        [[0,0,5,0],[5,5,5,0],[0,0,0,0],[0,0,0,0]],
        [[0,5,0,0],[0,5,0,0],[0,5,5,0],[0,0,0,0]],
        [[0,0,0,0],[5,5,5,0],[5,0,0,0],[0,0,0,0]],
        [[5,5,0,0],[0,5,0,0],[0,5,0,0],[0,0,0,0]]
    ],
    // O形方块
    [
        [[0,6,6,0],[0,6,6,0],[0,0,0,0],[0,0,0,0]],
        [[0,6,6,0],[0,6,6,0],[0,0,0,0],[0,0,0,0]],
        [[0,6,6,0],[0,6,6,0],[0,0,0,0],[0,0,0,0]],
        [[0,6,6,0],[0,6,6,0],[0,0,0,0],[0,0,0,0]]
    ],
    // J形方块
    [
        [[7,0,0,0],[7,7,7,0],[0,0,0,0],[0,0,0,0]],
        [[0,7,7,0],[0,7,0,0],[0,7,0,0],[0,0,0,0]],
        [[0,0,0,0],[7,7,7,0],[0,0,7,0],[0,0,0,0]],
        [[0,7,0,0],[0,7,0,0],[7,7,0,0],[0,0,0,0]]
    ]
];

// 游戏状态
const GAME_STATES = {
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 游戏类
class Tetris {
    constructor() {
        // 获取画布和上下文
        this.gameBoard = document.getElementById('gameBoard');
        this.ctx = this.gameBoard.getContext('2d');
        this.nextPieceCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextPieceCanvas.getContext('2d');
        
        // 游戏数据
        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameState = GAME_STATES.READY;
        this.dropCounter = 0;
        this.dropInterval = 1000; // 初始下落速度(毫秒)
        this.lastTime = 0;
        
        // 当前方块和下一个方块
        this.currentPiece = null;
        this.nextPiece = null;
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 设置画布大小
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
        
        // 设置下一个方块预览画布
        this.nextCtx.canvas.width = 4 * BLOCK_SIZE;
        this.nextCtx.canvas.height = 4 * BLOCK_SIZE;
        this.nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
        // 确保画布背景色与CSS一致
        this.nextCtx.fillStyle = '#111';
        this.nextCtx.fillRect(0, 0, 4, 4);
        
        // 绑定按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        
        // 绑定键盘事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 绘制初始界面
        this.drawBoard();
        this.drawNextPiece();
        this.updateScore();
    }
    
    // 创建空网格
    createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    
    // 开始游戏
    start() {
        if (this.gameState === GAME_STATES.READY || this.gameState === GAME_STATES.GAME_OVER) {
            // 重置游戏数据
            this.grid = this.createGrid();
            this.score = 0;
            this.lines = 0;
            this.level = 1;
            this.dropInterval = 1000;
            this.updateScore();
            
            // 生成方块
            this.currentPiece = this.generatePiece();
            this.nextPiece = this.generatePiece();
            
            // 更新游戏状态
            this.gameState = GAME_STATES.PLAYING;
            document.getElementById('gameOver').style.display = 'none';
            
            // 开始游戏循环
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    // 暂停/继续游戏
    togglePause() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            this.lastTime = 0;
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    // 重新开始游戏
    restart() {
        this.start();
    }
    
    // 游戏结束
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = this.score;
    }
    
    // 生成新方块
    generatePiece() {
        const type = Math.floor(Math.random() * 7) + 1; // 1-7对应不同形状
        return {
            type: type,
            shape: SHAPES[type][0], // 初始形状(第一个旋转状态)
            rotation: 0, // 当前旋转状态
            x: Math.floor(COLS / 2) - 2, // 初始X位置(居中)
            y: 0 // 初始Y位置(顶部)
        };
    }
    
    // 游戏主循环
    gameLoop(time = 0) {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        // 更新下落计时器
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.moveDown();
        }
        
        // 绘制游戏
        this.draw();
        
        // 继续循环
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // 绘制游戏
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // 绘制游戏面板
        this.drawBoard();
        
        // 绘制当前方块
        this.drawPiece();
        
        // 绘制下一个方块
        this.drawNextPiece();
    }
    
    // 绘制游戏面板
    drawBoard() {
        // 绘制已固定的方块
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] > 0) {
                    this.ctx.fillStyle = COLORS[this.grid[y][x]];
                    this.ctx.fillRect(x, y, 1, 1);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(x, y, 1, 1);
                }
            }
        }
        
        // 绘制网格线
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.02;
        
        // 垂直线
        for (let x = 0; x <= COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, ROWS);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(COLS, y);
            this.ctx.stroke();
        }
    }
    
    // 绘制当前方块
    drawPiece() {
        if (!this.currentPiece) return;
        
        const { shape, x, y, type } = this.currentPiece;
        
        this.ctx.fillStyle = COLORS[type];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    this.ctx.fillRect(x + col, y + row, 1, 1);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(x + col, y + row, 1, 1);
                }
            }
        }
    }
    
    // 绘制下一个方块
    drawNextPiece() {
        // 清空画布 - 使用Canvas的实际宽高而不是缩放后的坐标
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width / BLOCK_SIZE, this.nextCtx.canvas.height / BLOCK_SIZE);
        
        // 绘制背景
        this.nextCtx.fillStyle = '#111';
        this.nextCtx.fillRect(0, 0, 4, 4);
        
        if (!this.nextPiece) return;
        
        const { shape, type } = this.nextPiece;
        
        // 计算方块的实际尺寸
        const shapeWidth = this.getShapeWidth(shape);
        const shapeHeight = this.getShapeHeight(shape);
        
        // 计算居中偏移量（确保为整数以避免模糊）
        const offsetX = Math.floor((4 - shapeWidth) / 2);
        const offsetY = Math.floor((4 - shapeHeight) / 2);
        
        // 居中显示
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    // 设置填充颜色
                    this.nextCtx.fillStyle = COLORS[type];
                    // 绘制填充方块
                    this.nextCtx.fillRect(col + offsetX, row + offsetY, 1, 1);
                    // 绘制边框 - 使用更明显的边框
                    this.nextCtx.strokeStyle = '#FFFFFF';
                    this.nextCtx.lineWidth = 0.1;
                    this.nextCtx.strokeRect(col + offsetX, row + offsetY, 1, 1);
                }
            }
        }
    }
    
    // 获取方块形状的实际宽度
    getShapeWidth(shape) {
        let minCol = 3;
        let maxCol = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    minCol = Math.min(minCol, col);
                    maxCol = Math.max(maxCol, col);
                }
            }
        }
        
        return maxCol - minCol + 1;
    }
    
    // 获取方块形状的实际高度
    getShapeHeight(shape) {
        let minRow = 3;
        let maxRow = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    minRow = Math.min(minRow, row);
                    maxRow = Math.max(maxRow, row);
                }
            }
        }
        
        return maxRow - minRow + 1;
    }
    
    // 更新分数显示
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    // 碰撞检测
    checkCollision(piece = this.currentPiece) {
        const { shape, x, y } = piece;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // 检查边界
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    
                    // 检查与已固定方块的碰撞
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 旋转方块
    rotate() {
        if (!this.currentPiece || this.gameState !== GAME_STATES.PLAYING) return;
        
        const { type, rotation } = this.currentPiece;
        const newRotation = (rotation + 1) % 4;
        const newShape = SHAPES[type][newRotation];
        
        // 尝试旋转
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = newShape;
        this.currentPiece.rotation = newRotation;
        
        // 如果旋转后发生碰撞，尝试左右移动来适应旋转
        if (this.checkCollision()) {
            // 尝试向左移动
            this.currentPiece.x -= 1;
            if (this.checkCollision()) {
                // 尝试向右移动
                this.currentPiece.x += 2;
                if (this.checkCollision()) {
                    // 如果仍然碰撞，恢复原状
                    this.currentPiece.x -= 1;
                    this.currentPiece.shape = originalShape;
                    this.currentPiece.rotation = rotation;
                }
            }
        }
    }
    
    // 向左移动
    moveLeft() {
        if (!this.currentPiece || this.gameState !== GAME_STATES.PLAYING) return;
        
        this.currentPiece.x -= 1;
        
        if (this.checkCollision()) {
            this.currentPiece.x += 1; // 恢复位置
        }
    }
    
    // 向右移动
    moveRight() {
        if (!this.currentPiece || this.gameState !== GAME_STATES.PLAYING) return;
        
        this.currentPiece.x += 1;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= 1; // 恢复位置
        }
    }
    
    // 向下移动
    moveDown() {
        if (!this.currentPiece || this.gameState !== GAME_STATES.PLAYING) return;
        
        this.dropCounter = 0;
        this.currentPiece.y += 1;
        
        if (this.checkCollision()) {
            this.currentPiece.y -= 1; // 恢复位置
            this.lockPiece(); // 固定方块
            this.clearLines(); // 检查并清除完整行
            this.getNextPiece(); // 获取下一个方块
        }
    }
    
    // 快速下落(直接落到底部)
    hardDrop() {
        if (!this.currentPiece || this.gameState !== GAME_STATES.PLAYING) return;
        
        while (!this.checkCollision()) {
            this.currentPiece.y += 1;
        }
        
        this.currentPiece.y -= 1; // 恢复到最后一个有效位置
        this.lockPiece(); // 固定方块
        this.clearLines(); // 检查并清除完整行
        this.getNextPiece(); // 获取下一个方块
    }
    
    // 固定当前方块到网格
    lockPiece() {
        const { shape, x, y, type } = this.currentPiece;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    const newY = y + row;
                    const newX = x + col;
                    
                    // 检查是否超出顶部边界(游戏结束条件)
                    if (newY < 0) {
                        this.gameOver();
                        return;
                    }
                    
                    // 将方块固定到网格
                    this.grid[newY][newX] = type;
                }
            }
        }
    }
    
    // 获取下一个方块
    getNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        
        // 检查新方块是否立即碰撞(游戏结束条件)
        if (this.checkCollision()) {
            this.gameOver();
        }
    }
    
    // 清除完整行
    clearLines() {
        let linesCleared = 0;
        
        for (let y = ROWS - 1; y >= 0; y--) {
            // 检查当前行是否已满
            const isRowFull = this.grid[y].every(cell => cell > 0);
            
            if (isRowFull) {
                // 移除当前行
                this.grid.splice(y, 1);
                // 在顶部添加新的空行
                this.grid.unshift(Array(COLS).fill(0));
                // 增加已清除行数
                linesCleared++;
                // 由于删除了一行，需要重新检查当前位置
                y++;
            }
        }
        
        // 更新分数和等级
        if (linesCleared > 0) {
            // 计算分数(根据一次清除的行数给予不同奖励)
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            
            // 更新已清除行数
            this.lines += linesCleared;
            
            // 每清除10行提升一个等级
            this.level = Math.floor(this.lines / 10) + 1;
            
            // 随着等级提高，下落速度加快
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            // 更新显示
            this.updateScore();
        }
    }
    
    // 处理键盘事件
    handleKeyPress(event) {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        switch (event.keyCode) {
            case 37: // 左箭头
                this.moveLeft();
                break;
            case 39: // 右箭头
                this.moveRight();
                break;
            case 40: // 下箭头
                this.moveDown();
                break;
            case 38: // 上箭头
                this.rotate();
                break;
            case 32: // 空格键
                this.hardDrop();
                break;
        }
        
        // 重新绘制游戏
        this.draw();
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris();
});