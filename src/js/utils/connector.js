/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 4/11/20.
 */

import extend from '../env/tools/extend';
import Emitter from '../env/tools/emitter';
import log from './log';

class Connector extends Emitter{
  constructor (_options) {
    super();

    let base = extend({
      protocol: null,
      host: null,
      port: null,
    }, _options);

    this._protocol = base.protocol;
    this._host = base.host;
    this._port = base.port;

    this.create_socket();
  }

  create_socket () {
    this._socket = new WebSocket(this.generateUrl());
    this._socket.addEventListener('open', this._onOpen.bind(this));
    this._socket.addEventListener('close', this._onClose.bind(this));
    this._socket.addEventListener('message', this._onMessage.bind(this));
    this._socket.addEventListener('error', this._onError.bind(this));
  }

  generateUrl () {
    if (this._host === '') {
      this._host = 'localhost';
    }

    return this._protocol + '://' + this._host + ':' + this._port;
  }

  close () {
    this._socket.close();
  }

  socket () {
    return this._socket;
  }

  _onOpen (_data) {
    log(log.INFO, 'Connection [' + this.generateUrl() + '] opened');
    this.emit('open', _data.data);
  }

  _onClose (_data) {
    if (_data.wasClean) {
      log(log.INFO, 'Closed clean');
    } else {
      log(log.INFO, 'Connection closed by server'); // например, "убит" процесс сервера
    }
    log(log.INFO, 'Code: ' + _data.code + ' reason: ' + _data.reason);
    this.emit('closed', _data);
  }

  _onMessage (_data) {
    let parsed = JSON.parse(_data.data);
    log(log.INFO, '\n%cIN:\n%s', 'color: red', JSON.stringify(parsed, null, 3));
    this.emit('data', parsed);
  }

  _onError (_error) {
    log(log.INFO, 'ERR:\n' + _error.message);
    this.emit('error', _error);
  }

  send (_data) {
    let result = JSON.stringify(_data);
    log(log.INFO, '\n%cOUT:\n%s', 'color: blue', JSON.stringify(_data, null, 3));
    this._socket.send(result);
  }
}

export default Connector;