// A rule was broken. The code says which rule; the message is for the person.
// Services throw this and know nothing about HTTP: the route turns the code into a status.
class ServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

module.exports = { ServiceError };
