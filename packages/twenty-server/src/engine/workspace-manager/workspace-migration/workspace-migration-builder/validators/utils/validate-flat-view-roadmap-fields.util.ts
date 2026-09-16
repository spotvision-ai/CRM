import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const ROADMAP_GROUP_ALLOWED_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.RELATION,
];

type FlatFieldMetadataMapsForValidation =
  MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'view'>['flatFieldMetadataMaps'];

export const validateFlatViewRoadmapFields = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: FlatFieldMetadataMapsForValidation;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const startIdentifier = flatView.roadmapFieldStartUniversalIdentifier;
  const endIdentifier = flatView.roadmapFieldEndUniversalIdentifier;

  if (!isDefined(startIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap view must have a start date field`,
      userFriendlyMessage: msg`Roadmap view must have a start date field`,
    });
  }

  if (!isDefined(endIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap view must have an end date field`,
      userFriendlyMessage: msg`Roadmap view must have an end date field`,
    });
  }

  if (
    isDefined(startIdentifier) &&
    isDefined(endIdentifier) &&
    startIdentifier === endIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap start and end fields must be different`,
      userFriendlyMessage: msg`Roadmap start and end fields must be different`,
    });
  }

  const validateDateField = (
    identifier: string | null | undefined,
    missingMessage: string,
    missingUserFriendly: ReturnType<typeof msg>,
    wrongTypeMessage: string,
    wrongTypeUserFriendly: ReturnType<typeof msg>,
  ): void => {
    if (!isDefined(identifier)) {
      return;
    }
    const field = findFlatEntityByUniversalIdentifier({
      universalIdentifier: identifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(field)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: missingMessage,
        userFriendlyMessage: missingUserFriendly,
      });
      return;
    }
    if (!isFieldMetadataDateKind(field.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: wrongTypeMessage,
        userFriendlyMessage: wrongTypeUserFriendly,
      });
    }
  };

  validateDateField(
    startIdentifier,
    t`Roadmap start field metadata not found`,
    msg`Roadmap start field metadata not found`,
    t`Roadmap start field must be a DATE or DATE_TIME field`,
    msg`Roadmap start field must be a date field`,
  );

  validateDateField(
    endIdentifier,
    t`Roadmap end field metadata not found`,
    msg`Roadmap end field metadata not found`,
    t`Roadmap end field must be a DATE or DATE_TIME field`,
    msg`Roadmap end field must be a date field`,
  );

  const validateOptionalField = (
    identifier: string | null | undefined,
    allowedTypes: FieldMetadataType[],
    missingMessage: string,
    missingUserFriendly: ReturnType<typeof msg>,
    wrongTypeMessage: string,
    wrongTypeUserFriendly: ReturnType<typeof msg>,
  ): void => {
    if (!isDefined(identifier)) {
      return;
    }
    const field = findFlatEntityByUniversalIdentifier({
      universalIdentifier: identifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(field)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: missingMessage,
        userFriendlyMessage: missingUserFriendly,
      });
      return;
    }
    if (!allowedTypes.includes(field.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: wrongTypeMessage,
        userFriendlyMessage: wrongTypeUserFriendly,
      });
    }
  };

  validateOptionalField(
    flatView.roadmapFieldGroupUniversalIdentifier,
    ROADMAP_GROUP_ALLOWED_FIELD_TYPES,
    t`Roadmap group field metadata not found`,
    msg`Roadmap group field metadata not found`,
    t`Roadmap group field must be a SELECT or RELATION field`,
    msg`Roadmap group field must be a select or relation field`,
  );

  validateOptionalField(
    flatView.roadmapFieldColorUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap color field metadata not found`,
    msg`Roadmap color field metadata not found`,
    t`Roadmap color field must be a SELECT field`,
    msg`Roadmap color field must be a select field`,
  );

  // Label field can be any type — no type assertion. Still verify FK resolves.
  if (isDefined(flatView.roadmapFieldLabelUniversalIdentifier)) {
    const labelField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.roadmapFieldLabelUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(labelField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap label field metadata not found`,
        userFriendlyMessage: msg`Roadmap label field metadata not found`,
      });
    }
  }

  if (isDefined(flatView.roadmapFieldPlannedStartUniversalIdentifier)) {
    const plannedStartField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.roadmapFieldPlannedStartUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(plannedStartField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned start field metadata not found`,
        userFriendlyMessage: msg`Roadmap planned start field metadata not found`,
      });
    } else if (!isFieldMetadataDateKind(plannedStartField.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned start field must be a DATE or DATE_TIME field`,
        userFriendlyMessage: msg`Roadmap planned start field must be a date field`,
      });
    }
  }

  if (isDefined(flatView.roadmapFieldPlannedEndUniversalIdentifier)) {
    const plannedEndField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.roadmapFieldPlannedEndUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(plannedEndField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned end field metadata not found`,
        userFriendlyMessage: msg`Roadmap planned end field metadata not found`,
      });
    } else if (!isFieldMetadataDateKind(plannedEndField.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned end field must be a DATE or DATE_TIME field`,
        userFriendlyMessage: msg`Roadmap planned end field must be a date field`,
      });
    }
  }

  validateOptionalField(
    flatView.roadmapFieldStatusUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap status field metadata not found`,
    msg`Roadmap status field metadata not found`,
    t`Roadmap status field must be a SELECT field`,
    msg`Roadmap status field must be a select field`,
  );

  validateOptionalField(
    flatView.roadmapFieldBlockedByUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap blocked-by field metadata not found`,
    msg`Roadmap blocked-by field metadata not found`,
    t`Roadmap blocked-by field must be a SELECT field`,
    msg`Roadmap blocked-by field must be a select field`,
  );

  return errors;
};
