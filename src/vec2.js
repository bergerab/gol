class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    sub(o) {
        return new Vec2(this.x-o.x, this.y-o.y);
    }

    add(o) {
        return new Vec2(this.x+o.x, this.y+o.y);
    }

    hyp() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    divScalar(s) {
        return new Vec2(this.x/s, this.y/s);
    }
    
    mulScalar(s) {
        return new Vec2(this.x*s, this.y*s);
    }

    minMax(s) {
        return new Vec2(Math.max(-s, Math.min(s, this.x)), Math.max(-s, Math.min(s, this.y)));
    }

    static distance(a, b) {
        const diff = a.sub(b);
        return Math.abs(diff.hyp());
    }
}

module.exports = Vec2;
