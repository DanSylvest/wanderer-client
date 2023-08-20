<template>
  <div class="md-elevation-2 wd-popup wd-tooltip wd off-events absolute flex flex-column flex-justify-center">
    <div class="wd-tooltip__content">
      <template v-if="showContent">
        <slot></slot>
      </template>
    </div>
  </div>
</template>

<script>
  import SpamFilter from '../../js/env/spamFilter.js';

  const getContextContainer = function () {
    let arr = document.getElementsByClassName('c-contexts-container');
    let element;
    if (arr.length === 0) {
      element = document.createElement('div');
      document.body.appendChild(element);

      element.setAttribute('class', 'c-contexts-container wd absolute top left');
      element.style.width = '100%';
      element.style.height = '0px';
    } else {
      element = arr[0];
    }

    return element;
  };

  const OFFSET = 5;
  const OFFSET_EDGES = 10;

  export default {
    name: 'Tooltip',
    props: {
      customPosition: {
        type: Boolean,
        default: true,
      },
      placement: {
        type: String,
        default: 'bottom',
      },
      activated: {
        type: Boolean,
        default: false,
      },
      offsetX: {
        type: Number,
        default: 0,
      },
      offsetY: {
        type: Number,
        default: 0,
      },
      delay: {
        type: Number,
        default: 50
      }
    },
    components: {},
    data: function () {
      return {
        lCustomPosition: this.customPosition,
        lPlacement: this.placement,
        lActivated: this.activated,
        lOffsetX: this.offsetX,
        lOffsetY: this.offsetY,
        showContent: false,
      };
    },
    mounted: function () {
      this._tid = -1;
      this.isEnable = true;

      this.contextBody = this.$el;
      this.parent = this.$el.parentElement;
      this.parent.removeChild(this.contextBody);

      if (!this.customPosition) {
        this.parent.addEventListener('mouseover', this._onMouseOver.bind(this));
        this.parent.addEventListener('mouseout', this._onMouseOut.bind(this));
      }

      this.handlers = {
        onShowAnimationEnd: this._onShowAnimationEnd.bind(this),
        onHideAnimationEnd: this._onHideAnimationEnd.bind(this),
      };

      this.$nextTick(function () {
        this.update();
      }.bind(this));

      this._delayedUpdateOffsetsSF = new SpamFilter(this._delayedUpdateOffsets.bind(this), 10);
      this._delayedUpdateSF = new SpamFilter(this._delayedUpdate.bind(this), this.delay);
    },
    beforeDestroy: function () {
      this._delayedUpdateOffsetsSF.stop();
      this._delayedUpdateSF.stop();

      this._tid !== -1 && clearTimeout(this._tid);
      this._tid = -1;

      if (this.contextBody.parentElement !== null) {
        getContextContainer().removeChild(this.contextBody);
      }
    },
    methods: {
      _recalculateWidth () {
        let el = this.contextBody.querySelector('.wd-tooltip__content');
        let bounds = el.getBoundingClientRect();

        this.contextBody.style.width = bounds.width + 'px';
        this.contextBody.style.height = bounds.height + 'px';
      },
      show: function () {
        this.showContent = true;

        this.$nextTick(() => {
          if (this.contextBody.parentElement === null) {
            getContextContainer().appendChild(this.contextBody);
          }

          this.contextBody.classList.add('wd-popup-animate');
          this.contextBody.addEventListener('animationend', this.handlers.onShowAnimationEnd);

          this._recalculateWidth();

          this._addDOMObserver();
          this.updateOffsets(true);
          this._recalculate();
          this._delayedUpdateOffsetsSF.call();

          this.$nextTick(() => {
            this.contextBody.classList.add('transition-left');
          });

        });
      },
      hide: function () {
        this._removeDOMObserver();
        this._delayedUpdateOffsetsSF.stop();

        this.contextBody.classList.add('wd-popup-animate-fade');
        this.contextBody.addEventListener('animationend', this.handlers.onHideAnimationEnd);
        this.contextBody.classList.remove('transition-left');
      },
      updateOffsets (bool) {
        if (this.lCustomPosition) {
          this._actualOffsets(bool);
        } else {
          this._parentActualOffset();
        }
      },
      _delayedUpdateOffsets () {
        this._recalculateWidth();
        this.updateOffsets(true);
        this._recalculate();
      },
      _addDOMObserver () {
        this.observer = new MutationObserver((mutationsList) => {
          // Use traditional 'for loops' for IE 11
          for (const mutation of mutationsList) {
            if (mutation.target !== this.contextBody) {
              this._delayedUpdateOffsets();
              // this._delayedUpdateOffsetsSF.call();
            }
          }
        });
        this.observer.observe(this.contextBody, { attributes: true, childList: true, subtree: true });
      },

      _removeDOMObserver () {
        this.observer && this.observer.disconnect();

      },
      _delayedUpdate () {
        // this.$emit("update:activated", true);
        this.lActivated = true;
        this.update();
      },
      _onMouseOver () {
        this._delayedUpdateSF.call();
      },
      _onMouseOut () {
        this._delayedUpdateSF.stop();
        // this.$emit("update:activated", false);
        this.lActivated = false;
        this.update();
      },
      _onShowAnimationEnd: function () {
        this.contextBody.classList.remove('wd-popup-animate');
        this.contextBody.removeEventListener('animationend', this.handlers.onShowAnimationEnd);
      },
      _onHideAnimationEnd: function () {
        this.contextBody.classList.remove('wd-popup-animate-fade');
        this.contextBody.removeEventListener('animationend', this.handlers.onHideAnimationEnd);

        if (this.contextBody.parentElement !== null) {
          getContextContainer().removeChild(this.contextBody);
        }

        this.showContent = false;
      },

      update: function () {
        this.contextBody.removeEventListener('animationend', this.handlers.onShowAnimationEnd);
        this.contextBody.removeEventListener('animationend', this.handlers.onHideAnimationEnd);
        this.contextBody.classList.remove('wd-popup-animate');
        this.contextBody.classList.remove('wd-popup-animate-fade');

        // this.updateOffsets();

        this._tid !== -1 && clearTimeout(this._tid);
        this._tid = setTimeout(function () {
          this._tid = -1;
          this.lActivated ? this.show() : this.hide();
          // this._recalculate()
        }.bind(this), 0);
      },
      _actualOffsets: function (_notCalc) {
        if (!_notCalc) {
          document.body.appendChild(this.contextBody);
          this.contextBody.classList.add('left-top-force');
        }

        let ctxBodyBoundsAfter = this.contextBody.getBoundingClientRect();
        let bodyBounds = document.body.getBoundingClientRect();

        if (!_notCalc) {
          this.contextBody.classList.remove('left-top-force');
          document.body.removeChild(this.contextBody);
        }

        if (this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.width) {
          this.lOffsetX = bodyBounds.width - ctxBodyBoundsAfter.width;
        }

        if (this.lOffsetY + ctxBodyBoundsAfter.height > bodyBounds.height) {
          this.lOffsetY = bodyBounds.height - ctxBodyBoundsAfter.height;
        }
      },

      _parentActualOffset () {
        let bodyBounds = document.body.getBoundingClientRect();
        let parentBounds = this.parent.getBoundingClientRect();
        let ctxBodyBoundsAfter = this.contextBody.getBoundingClientRect();

        let currentPlacement = this.lPlacement;
        let exitwhen = false;
        let tries = 0;

        while (!exitwhen && tries < 2) {
          switch (currentPlacement) {
            case 'bottom':
              this.lOffsetY = parentBounds.y + parentBounds.height + OFFSET;
              this.lOffsetX = (parentBounds.x + parentBounds.width / 2) - (ctxBodyBoundsAfter.width / 2);

              if (this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.x + bodyBounds.width) {
                this.lOffsetX = bodyBounds.x + bodyBounds.width - (ctxBodyBoundsAfter.width + OFFSET_EDGES);
              }

              if (this.lOffsetX < bodyBounds.x) {
                this.lOffsetX = OFFSET_EDGES;
              }

              if (this.lOffsetY + ctxBodyBoundsAfter.height > bodyBounds.y + bodyBounds.height) {
                currentPlacement = 'top';
                tries++;
                break;
              }

              exitwhen = true;
              break;
            case 'top':
              this.lOffsetY = parentBounds.y - ctxBodyBoundsAfter.height - OFFSET;
              this.lOffsetX = (parentBounds.x + parentBounds.width / 2) - (ctxBodyBoundsAfter.width / 2);

              if (this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.x + bodyBounds.width) {
                this.lOffsetX = bodyBounds.x + bodyBounds.width - (ctxBodyBoundsAfter.width + OFFSET_EDGES);
              }

              if (this.lOffsetX < bodyBounds.x) {
                this.lOffsetX = OFFSET_EDGES;
              }

              if (this.lOffsetY < bodyBounds.y) {
                currentPlacement = 'bottom';
                tries++;
                break;
              }

              exitwhen = true;
              break;
          }
        }

      },
      _recalculate: function () {
        this.contextBody.style.left = this.lOffsetX + 'px';
        this.contextBody.style.top = this.lOffsetY + 'px';

      },
    },
    watch: {
      activated: function (_val) {
        this.lActivated = _val;
        this.update();
      },
      offsetX: function (_val) {
        this.lOffsetX = _val;
        this.update();
      },
      offsetY: function (_val) {
        this.lOffsetY = _val;
        this.update();
      },
    },
  };
</script>

<style lang="scss">
  .wd-tooltip {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;

    width: 0;
    height: 0;
    transition: width 450ms, height 250ms;

    &.transition-left {
      left: 0;
      transition: left 250ms;
    }

    .wd-tooltip__content {
      width: auto;
      height: auto;
    }
  }
</style>