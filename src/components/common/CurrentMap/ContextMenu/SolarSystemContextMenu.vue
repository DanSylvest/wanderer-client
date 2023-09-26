<template>
  <context-menu
    :c-activated.sync="localShow" :c-offset-x="offset.x" :c-offset-y="offset.y"
    @c-closed="onClosedSystemContext"
  >
    <context-menu-item c-title="Tag system" c-icon="spellcheck" :c-is-submenu="true">
      <context-menu-item c-title="Clear" c-icon="block" @click="onTagClick('')" />
      <context-menu-item c-title="Letter" c-icon="edit" :c-is-submenu="true">
        <context-menu-item
          :c-active="item.active"
          :c-title="item.tagName.toString()"
          v-for="item in letters"
          :key="item.uid"
          @click="onTagClick(item.tagName)"
        />
      </context-menu-item>
      <context-menu-item c-title="Digit" c-icon="edit" :c-is-submenu="true">
        <context-menu-item
          :c-active="item.active"
          :c-title="item.tagName.toString()"
          v-for="item in digits"
          :key="item.uid"
          @click="onTagClick(item.tagName)"
        />
      </context-menu-item>
    </context-menu-item>
    <context-menu-item c-title="Status" c-icon="report_problem" :c-is-submenu="true">
      <context-menu-item
        :c-active="item.active"
        :c-title="item.name"
        :c-icon="item.icon"
        :c-icon-class="'eve-system-status-color-' + item.id"
        v-for="(item, index) in statuses"
        :key="item.uid"
        @click="onStatusClick(index)"
      />
    </context-menu-item>
    <context-menu-item c-title="Copy name" c-icon="content_copy" @click="onSystemCopyName" />
    <context-menu-item
      v-if="userOnlineCharacters.length > 0" c-title="Waypoints" c-icon="call_split"
      :c-is-submenu="true" v-show="isSystemInKSpace"
    >
      <!-- Show sub-items instant if more than one character are attached -->
      <template v-if="userOnlineCharacters.length > 1">
        <context-menu-item
          v-for="{name, charId} in userOnlineCharacters" :c-is-submenu="true" :c-title="name"
          :key="charId"
        >
          <context-menu-item c-title="Set Destination" c-icon="near_me" @click="onSetDestination(charId)" />
          <context-menu-item
            c-title="Add Waypoint Front" c-icon="call_missed"
            @click="onAddWaypointFront(charId)"
          />
          <context-menu-item
            c-title="Add Waypoint Back" c-icon="call_missed_outgoing"
            @click="onAddWaypointBack(charId)"
          />
        </context-menu-item>
      </template>

      <!-- Show sub-items instant if only one character are attached -->
      <template v-if="userOnlineCharacters.length === 1">
        <context-menu-item
          c-title="Set Destination"
          c-icon="near_me"
          @click="onSetDestination(userOnlineCharacters[0].charId)"
        />
        <context-menu-item
          c-title="Add Waypoint Front" c-icon="call_missed"
          @click="onAddWaypointFront(userOnlineCharacters[0].charId)"
        />
        <context-menu-item
          c-title="Add Waypoint Back" c-icon="call_missed_outgoing"
          @click="onAddWaypointBack(userOnlineCharacters[0].charId)"
        />
      </template>
    </context-menu-item>

    <context-menu-item c-title="Mark as hub" c-icon="near_me" v-show="markAsHub" @click="onMarkAsHub(true)" />
    <context-menu-item
      c-title="Unmark as hub" c-icon="near_me_disabled" v-show="!markAsHub"
      @click="onMarkAsHub(false)"
    />

    <context-menu-item
      c-title="Unlock system" c-icon="lock_open" v-show="isLocked"
      @click="onSystemContextMenuUnlock"
    />
    <context-menu-item c-title="Lock system" c-icon="lock" v-show="!isLocked" @click="onSystemContextMenuLock" />
    <context-menu-item
      c-title="Remove system" c-icon="delete" c-icon-class="fg-negative" v-show="!isLocked"
      @click="onSystemContextMenuRemove"
    />

    {{ loadCharacters_ }}
  </context-menu>
</template>

<script>
  import ContextMenu from '../../../ui/ContextMenu/ContextMenu';
  import ContextMenuItem from '../../../ui/ContextMenu/ContextMenuItem';
  import environment from '../../../../js/core/map/environment.js';
  import api from '../../../../js/api.js';
  import helper from '../../../../js/utils/helper.js';
  import { UserCharactersMixin } from '../UserCharacters/mixins/userCharacters';
  import { CharacterSubscription } from '../../../utils/characterSubscription';

  let uuidCounter = 0;
  export default {
    name: 'SolarSystemContextMenu',
    components: { ContextMenu, ContextMenuItem },
    props: {
      data: {
        type: Object,
        default: function () {
          return {
            offset: { x: 0, y: 0 },
            tag: '',
            status: -1,
            isSystemInKSpace: false,
            markAsHub: false,
            isLocked: false,
            mapId: '',
            solarSystemId: '',
          };
        },
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    watch: {
      show (val) {
        this.localShow = val;
      },
      data (val) {
        this.offset = val.offset;
        this.markAsHub = val.markAsHub;
        this.solarSystemId = val.solarSystemId;
        this.tag = val.tag;
        this.status = val.status;
        this.isLocked = val.isLocked;
        this.isSystemInKSpace = val.isSystemInKSpace;
        this.reload();

        // todo this is not good solve... but $emit("update:map-id", this.data.mapId); is not work...
        UserCharactersMixin.watch.mapId.call(this, this.data.mapId);
      },
    },
    data: function () {
      return {
        isSystemInKSpace: this.data.isSystemInKSpace,
        offset: this.data.offset,
        markAsHub: this.data.markAsHub,
        tag: this.data.tag,
        status: this.data.status,
        solarSystemId: this.data.solarSystemId,
        isLocked: this.data.isLocked,
        localShow: this.show,
        letters: [],
        digits: [],
        statuses: [],
        wChars: [],
      };
    },
    mounted () {
      this.charactersSubscriptions_ = Object.create(null);
    },
    mixins: [
      UserCharactersMixin,
    ],
    computed: {
      loadCharacters_ () {
        const characters = this.userCharactersList.filter(({ online }) => online);
        this.updateCharactersSubscriptions(characters.map(({ charId }) => charId));
        return null;
      },

      /**
       *
       * @returns {{charId: string, name: *}[]}
       */
      userOnlineCharacters () {
        let out = [];
        for (const charId of this.wChars) {
          out.push({
            charId: parseInt(charId),
            ...this.$store.state.characters[charId].publicInfo,
          });
        }

        return out;
      },
    },
    methods: {
      updateCharactersSubscriptions (characters) {
        for (const charId in this.charactersSubscriptions_) {
          if (!characters.includes(charId)) {
            this.charactersSubscriptions_[charId].destructor();
            delete this.charactersSubscriptions_[charId];
            this.wChars.removeByValue(charId);
          }
        }

        for (const charId of characters) {
          if (!this.charactersSubscriptions_[charId]) {
            this.charactersSubscriptions_[charId] = new CharacterSubscription(
              charId,
              () => this.wChars.push(charId),
            );
          }
        }
      },

      reload: function () {
        this.letters = environment.letters.map(x => ({
          active: x.toString() === this.tag,
          uid: uuidCounter++,
          tagName: x,
        }));

        this.digits = environment.digits.map(x => ({
          active: x.toString() === this.tag,
          uid: uuidCounter++,
          tagName: x,
        }));

        this.statuses = environment.statuses.slice().map((x, i) => {
          x.active = i === this.status;
          x.uid = uuidCounter++;
          return x;
        });
      },
      onTagClick (letter) {
        this.$emit('contextActivated', {
          type: 'tag',
          data: letter,
        });
      },
      onStatusClick (status) {
        this.$emit('contextActivated', {
          type: 'status',
          data: status,
        });
      },
      onClosedSystemContext () {
        this.$emit('update:show', false);
      },
      onSystemCopyName () {
        this.$emit('contextActivated', {
          type: 'copyName',
        });
      },
      onSetDestination (characterId) {
        api.eve.map.waypoint(characterId, 0, this.solarSystemId)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onAddWaypointFront: function (characterId) {
        api.eve.map.waypoint(characterId, 1, this.solarSystemId)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onAddWaypointBack: function (characterId) {
        api.eve.map.waypoint(characterId, 2, this.solarSystemId)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onMarkAsHub (bool) {
        this.$emit('contextActivated', {
          type: 'markAsHub',
          data: bool,
        });
      },
      onSystemContextMenuLock: function () {
        api.eve.map.solarSystem.update(this.data.mapId, this.solarSystemId, { isLocked: true })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onSystemContextMenuUnlock: function () {
        api.eve.map.solarSystem.update(this.data.mapId, this.solarSystemId, { isLocked: false })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onSystemContextMenuRemove: function () {
        api.eve.map.solarSystem.remove(this.data.mapId, [this.solarSystemId])
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
    },
  };
</script>

<style scoped>

</style>