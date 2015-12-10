function hooksException() {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'hooksException';
    this.stack = temp.stack;
    this.message = 'hooks exception: ' + temp.message;
}
hooksException.prototype = Object.create(Error.prototype, {
    constructor: {
        value: hooksException,
        writable: true,
        configurable: true
    }
});

module.exports = hooksException;