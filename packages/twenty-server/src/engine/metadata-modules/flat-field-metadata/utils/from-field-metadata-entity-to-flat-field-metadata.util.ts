import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFieldMetadataEntityToFlatFieldMetadata = (
  args: FromEntityToFlatEntityArgs<'fieldMetadata'>,
): FlatFieldMetadata => {
  const {
    entity: fieldMetadataEntity,
    fieldMetadataIdToUniversalIdentifierMap,
  } = args;

  const fieldMetadataScalarEntity = fromEntityToScalarEntity({
    metadataName: 'fieldMetadata',
    entity: fieldMetadataEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'fieldMetadata',
      ...args,
    });

  const settings = fieldMetadataEntity.settings;
  const isRelationSettings =
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION) ||
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.MORPH_RELATION);

  const settingsWithUniversalIdentifiers = isRelationSettings
    ? {
        ...settings,
        ...(isDefined(settings.junctionTargetFieldId) && {
          junctionTargetFieldUniversalIdentifier:
            fieldMetadataIdToUniversalIdentifierMap.get(
              settings.junctionTargetFieldId,
            ),
        }),
      }
    : settings;

  return {
    ...fieldMetadataScalarEntity,
    ...relationUniversalIdentifiers,
    kanbanAggregateOperationViewIds:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(({ id }) => id),
    calendarViewIds: fieldMetadataEntity.calendarViews.map(({ id }) => id),
    roadmapStartViewIds:
      fieldMetadataEntity.roadmapStartViews?.map(({ id }) => id) ?? [],
    roadmapEndViewIds:
      fieldMetadataEntity.roadmapEndViews?.map(({ id }) => id) ?? [],
    roadmapGroupViewIds:
      fieldMetadataEntity.roadmapGroupViews?.map(({ id }) => id) ?? [],
    roadmapColorViewIds:
      fieldMetadataEntity.roadmapColorViews?.map(({ id }) => id) ?? [],
    roadmapLabelViewIds:
      fieldMetadataEntity.roadmapLabelViews?.map(({ id }) => id) ?? [],
    roadmapPlannedStartViewIds:
      fieldMetadataEntity.roadmapPlannedStartViews?.map(({ id }) => id) ?? [],
    roadmapPlannedEndViewIds:
      fieldMetadataEntity.roadmapPlannedEndViews?.map(({ id }) => id) ?? [],
    roadmapStatusViewIds:
      fieldMetadataEntity.roadmapStatusViews?.map(({ id }) => id) ?? [],
    roadmapBlockedByViewIds:
      fieldMetadataEntity.roadmapBlockedByViews?.map(({ id }) => id) ?? [],
    mainGroupByFieldMetadataViewIds:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(({ id }) => id) ??
      [],
    viewFieldIds: fieldMetadataEntity.viewFields.map(({ id }) => id),
    viewFilterIds: fieldMetadataEntity.viewFilters.map(({ id }) => id),
    fieldPermissionIds:
      fieldMetadataEntity.fieldPermissions?.map(({ id }) => id) ?? [],
    viewFieldUniversalIdentifiers: fieldMetadataEntity.viewFields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFilterUniversalIdentifiers: fieldMetadataEntity.viewFilters.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    kanbanAggregateOperationViewUniversalIdentifiers:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    calendarViewUniversalIdentifiers: fieldMetadataEntity.calendarViews.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    roadmapStartViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapStartViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapEndViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapEndViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapGroupViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapGroupViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapColorViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapColorViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapLabelViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapLabelViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapPlannedStartViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapPlannedStartViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapPlannedEndViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapPlannedEndViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapStatusViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapStatusViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    roadmapBlockedByViewUniversalIdentifiers:
      fieldMetadataEntity.roadmapBlockedByViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    mainGroupByFieldMetadataViewUniversalIdentifiers:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    viewSortIds: fieldMetadataEntity.viewSorts?.map(({ id }) => id) ?? [],
    viewSortUniversalIdentifiers:
      fieldMetadataEntity.viewSorts?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    fieldPermissionUniversalIdentifiers:
      fieldMetadataEntity.fieldPermissions?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    universalSettings: settingsWithUniversalIdentifiers,
  };
};
