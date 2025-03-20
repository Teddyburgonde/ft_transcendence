const _ = require('lodash');
const { isString, isObject } = require('../utils/utilities');

const scratchpadContext = { namespace: 'scratchPad', userId: 0, teamId: 0 };

class PartitionMigrationService {
  static #instance;
  #shellMeta;
  #shellController;
  #partitionService;
  #logger;

  constructor (ctx = {}) {
    if (!ctx.shellMeta) {
      throw new Error('PartitionMigrationService ~ ctx.shellMeta is not defined');
    }
    this.#shellMeta = ctx.shellMeta;

    if (!ctx.shellController) {
      throw new Error('PartitionMigrationService ~ ctx.shellController is not defined');
    }
    this.#shellController = ctx.shellController;

    if (!ctx.partitionService) {
      throw new Error('PartitionMigrationService ~ ctx.partitionService is not defined');
    }
    this.#partitionService = ctx.partitionService;

    if (!ctx.logger) {
      throw new Error('PartitionMigrationService ~ ctx.logger is not defined');
    }
    this.#logger = ctx.logger;
  }

  static instance () {
    if (!PartitionMigrationService.#instance) {
      PartitionMigrationService.#instance = new PartitionMigrationService({
        shellMeta: require('./shellMeta'),
        shellController: require('./shellController'),
        partitionService: require('./partitionService'),
        logger: pm.logger
      });
    }
    return PartitionMigrationService.#instance;
  }

  /**
   * Determine if v7 partition system's active partition is not associated with any user account
   * @returns {Promise<Boolean>} returns true if the active partition of v7 is not associated with any user account. false, otherwise.
   *
   * NOTE: this method is public for testing reasons
   */
  async _isV7ActivePartitionSignedOut () {
    const activePartitionId = this.#shellMeta.getActivePartition();
    if (!activePartitionId) {
      return false;
    }

    const v7PartitionsObj = await this.#shellController.partitions.getValue();
    if (!v7PartitionsObj) {
      return false;
    }

    const partition = v7PartitionsObj[activePartitionId];
    if (!partition) {
      return false;
    }

    return !partition.userId;
  }

  /**
   * Checks two things
   * 1. Whether the partition is associated with user account on V7 partition system
   * 2. Whether the partition last updated is latest on V7 partition system
   *
   * NOTE: this method is public for testing reasons
   *
   * @param {Object} v8Partition The v8 partition object
   * @param {String} v8Partition.id The partition identifier
   * @param {Object} v8Partition.meta
   * @param {String} v8Partition.meta.lastUpdated The last accessed timestamp of partition
   * @returns {Promise<Boolean>}
   */
  async _isPartitionAccessedUsingV7BeforeOpeningV8App (v8Partition) {
    if (!isObject(v8Partition) || !isString(v8Partition.id) ||
        v8Partition.id.length === 0 ||
        !isObject(v8Partition.meta) || !isString(v8Partition.meta.lastUpdated) ||
        v8Partition.meta.lastUpdated.length === 0) {
      return false;
    }

    const v7PartitionsObj = await this.#shellController.partitions.getValue();
    if (!isObject(v7PartitionsObj)) {
      return false;
    }

    const userId = v7PartitionsObj[v8Partition.id] && v7PartitionsObj[v8Partition.id].userId;
    if (!isString(userId)) {
      return false;
    }

    const v7UsersObj = await this.#shellController.users.getValue();
    if (!isObject(v7UsersObj)) {
      return false;
    }

    const v7Partition = v7UsersObj[userId];
    if (!isObject(v7Partition)) {
      return false;
    }

    return Date.parse(v7Partition.lastUpdated) > Date.parse(v8Partition.meta.lastUpdated);
  }

  /**
   * Checks if the partition is an orphaned partition on V7 partition system
   * @param {String} partitionId The partition identifier
   * @returns {Promise<Boolean>}
   */
  async _isV7OrphanedPartition (partitionId) {
    if (!isString(partitionId) || partitionId.length === 0) {
      return false;
    }

    const partitionsObj = await this.#shellController.partitions.getValue();
    if (!isObject(partitionsObj)) {
      return false;
    }

    const partition = partitionsObj[partitionId];
    if (!isObject(partition)) {
      return false;
    }

    const { userId } = partition;
    if (!isString(userId)) {
      return false;
    }

    return userId.length === 0;
  }

  /**
   * ScratchPad partition initially used transit partition with namespace 'users'
   * to simulate the v7 application behaviour
   * To change the migration of scratchpad data to be on demand rather than automatic
   * we are moving the partition to 'scratchPad' namespace
   */
  async #rectifyNamespaceOfScratchPadPartition () {
    const scratchpadPartitions = this.#partitionService.find(scratchpadContext);

    if (!_.isEmpty(scratchpadPartitions)) {
      return;
    }
    this.#logger.info('partitionMigrationService~rectifyNamespaceOfScratchPadPartition: There is no partition with scratchpad namespace');

    const currentTransitPartitions = this.#partitionService.find({ namespace: 'users', userId: 0, teamId: 0 });

    if (_.isEmpty(currentTransitPartitions)) {
      this.#logger.info('partitionMigrationService~rectifyNamespaceOfScratchPadPartition: There is no transit partition which could have been used for scratchpad');
      return;
    }

    this.#logger.info('partitionMigrationService~rectifyNamespaceOfScratchPadPartition: There is transit partition which could have been used for scratchpad. changing namespace');

    await this.#partitionService.updateOne(currentTransitPartitions[0].id, scratchpadContext, currentTransitPartitions[0].meta);
  }

  /**
   * Logs the state of v7 partition system
   */
  #logV7PartitionSystemState () {
    this.#logger.info('partitionMigrationService: State of V7 partition:');

    const v7UsersObj = this.#shellController.getUsers(),
      v7PartitionsObj = this.#shellController.partitions.getValue(),
      printables = [];

    Object.values(v7PartitionsObj).forEach((partition) => {
      const printablePartition = {
        partitionId: partition.id
      };

      if (!_.isEmpty(partition.userId)) {
        printablePartition.userId = partition.userId;
        printablePartition.lastUpdated = v7UsersObj[partition.userId].lastUpdated;
      }
      printables.push(printablePartition);
    });

    this.#logger.info('partitionMigrationService: V7 partitions', printables);
  }

  async init () {
    await this.#shellController.init();
    await this.#shellMeta.init();
    this.#logV7PartitionSystemState();
    await this.#rectifyNamespaceOfScratchPadPartition();
    this.#logger.info('partitionMigrationService~init: Success');
  }

  /**
   * Checks if the partition is associated with a user account on V7 partition system
   * @param {String} partitionId The partition identifier
   * @returns {Promise<Boolean>}
   */
  async isV7UserContextPartition (partitionId) {
    if (_.isEmpty(partitionId)) {
      return;
    }

    const partitionsObj = await this.#shellController.partitions.getValue();

    if (_.isEmpty(partitionsObj[partitionId])) {
      return false;
    }

    const userId = partitionsObj[partitionId].userId;

    return isString(userId);
  }

  async runV8PartitionsIntegrity () {
    // Check integrity of v8 user context partitions
    const context = { namespace: 'users' },
      v8Partitions = await this.#partitionService.find(context),
      isCurrentPartitionActiveSignedoutV7 = await this._isV7ActivePartitionSignedOut(),
      activeV7PartitionId = this.#shellMeta.getActivePartition(),
      userContextPartitionsToBeRectified = [];

    await Promise.all(v8Partitions.map(async (partition) => {
      if (partition.context && partition.context.userId) {
        if (await this._isPartitionAccessedUsingV7BeforeOpeningV8App(partition) || (partition.id === activeV7PartitionId && isCurrentPartitionActiveSignedoutV7)) {
          userContextPartitionsToBeRectified.push(partition.id);
        } else if (await this._isV7OrphanedPartition(partition.id)) {
          userContextPartitionsToBeRectified.push(partition.id);
        }
      }
    }));

    this.#logger.info(
      'partitionMigrationService~runV8PartitionsIntegrity: Two way migration~ removing the following partitions from v8',
      userContextPartitionsToBeRectified);

    // Remove the partition mappings from v8 and let the migration be hit when the partition is used.
    await this.#partitionService.removePartitionEntries(userContextPartitionsToBeRectified);

    // Check integrity of v8 scratchpad partition
    const scratchPadPartitions = await this.#partitionService.find(scratchpadContext);

    if (_.isEmpty(scratchPadPartitions)) {
      return;
    }

    if (await this.isV7UserContextPartition(scratchPadPartitions[0].id)) {
      // Remove the scratchpad partition mapping from v8 and
      // let the migration be hit when the v7 user context partition is used on v8 application.
      this.#logger.info('partitionMigrationService~runV8PartitionsIntegrity: Two way migration~ removing the scratchpad entry from v8', scratchPadPartitions[0].id);
      return this.#partitionService.removePartitionEntries([scratchPadPartitions[0].id]);
    }
  }

  async migrateSignedOutPartitionAsScratchpad () {
    // Bail out, if v7 does not have a signed out partition
    if (!await this._isV7ActivePartitionSignedOut()) {
      return;
    }

    // Bail out, if v8 already have a scratchpad partitions
    // This is to maintain a single scratchpad partition
    const scratchPadPartitions = await this.#partitionService.find(scratchpadContext);

    if (!_.isEmpty(scratchPadPartitions)) {
      return;
    }

    this.#logger.info(
      'partitionMigrationService~migrateSignedOutPartitionAsScratchpad: Migrating v7 logged out state partition as scratchpad on v8 partition system',
      { partitionId: this.#shellMeta.getActivePartition() });

    return this.#partitionService.makeRawPartition(this.#shellMeta.getActivePartition(), scratchpadContext, {});
  }
}

module.exports = PartitionMigrationService;
