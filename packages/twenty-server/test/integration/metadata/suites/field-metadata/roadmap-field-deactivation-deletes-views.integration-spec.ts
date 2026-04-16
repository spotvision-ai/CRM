import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const VIEW_WITH_ROADMAP_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  roadmapFieldStartId
  roadmapFieldEndId
`;

type TestSetup = {
  objectMetadataId: string;
  startDateFieldId: string;
  endDateFieldId: string;
  unrelatedFieldId: string;
  roadmapViewId: string;
  tableViewId: string;
};

describe('roadmap-field-deactivation-deletes-views', () => {
  let testSetup: TestSetup;

  const verifyViewExists = async (viewId: string, shouldExist: boolean) => {
    const {
      data: { getView },
    } = await findOneView({
      viewId,
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: false,
    });

    if (shouldExist) {
      expect(isDefined(getView)).toBe(true);
    } else {
      expect(getView).toBeNull();
    }

    return getView;
  };

  const deactivateFieldAndVerify = async (fieldId: string) => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldId);
    expect(data.updateOneField.isActive).toBe(false);
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'roadmapCascadeTestObject',
        namePlural: 'roadmapCascadeTestObjects',
        labelSingular: 'Roadmap Cascade Test Object',
        labelPlural: 'Roadmap Cascade Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: startDateFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'roadmapStartAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Roadmap Start At',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: endDateFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'roadmapEndAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Roadmap End At',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: unrelatedFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'unrelatedText',
        type: FieldMetadataType.TEXT,
        label: 'Unrelated Text',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: { createView: roadmapView },
    } = await createOneView({
      input: {
        name: generateRecordName('Roadmap View'),
        objectMetadataId,
        type: ViewType.ROADMAP,
        icon: 'IconTimeline',
        roadmapFieldStartId: startDateFieldId,
        roadmapFieldEndId: endDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createView: tableView },
    } = await createOneView({
      input: {
        name: generateRecordName('Table View Without Roadmap'),
        objectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconTable',
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: false,
    });

    testSetup = {
      objectMetadataId,
      startDateFieldId,
      endDateFieldId,
      unrelatedFieldId,
      roadmapViewId: roadmapView.id,
      tableViewId: tableView.id,
    };
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  it('deletes the roadmap view when its start-date field is deactivated', async () => {
    await verifyViewExists(testSetup.roadmapViewId, true);
    await verifyViewExists(testSetup.tableViewId, true);

    await deactivateFieldAndVerify(testSetup.startDateFieldId);

    await verifyViewExists(testSetup.roadmapViewId, false);
    await verifyViewExists(testSetup.tableViewId, true);
  });

  it('deletes the roadmap view when its end-date field is deactivated', async () => {
    await verifyViewExists(testSetup.roadmapViewId, true);
    await verifyViewExists(testSetup.tableViewId, true);

    await deactivateFieldAndVerify(testSetup.endDateFieldId);

    await verifyViewExists(testSetup.roadmapViewId, false);
    await verifyViewExists(testSetup.tableViewId, true);
  });

  it('keeps the roadmap view when an unrelated field is deactivated', async () => {
    await verifyViewExists(testSetup.roadmapViewId, true);

    await deactivateFieldAndVerify(testSetup.unrelatedFieldId);

    await verifyViewExists(testSetup.roadmapViewId, true);
    await verifyViewExists(testSetup.tableViewId, true);
  });
});
