import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { resolveRoadmapRelationLabel } from '@/object-record/record-roadmap/utils/resolveRoadmapRelationLabel';

type TargetMetadata = Pick<
  EnrichedObjectMetadataItem,
  'fields' | 'labelIdentifierFieldMetadataId'
>;

const makeTarget = (
  fields: { id: string; name: string }[],
  labelIdentifierFieldMetadataId: string,
): TargetMetadata => ({
  fields: fields as unknown as FieldMetadataItem[],
  labelIdentifierFieldMetadataId,
});

// labelIdentifier is a plain `name` text field (company / opportunity).
const companyTarget = makeTarget([{ id: 'f-name', name: 'name' }], 'f-name');
// labelIdentifier is the `name` FULL_NAME composite (person / workspaceMember).
const personTarget = makeTarget([{ id: 'p-name', name: 'name' }], 'p-name');
// labelIdentifier is NOT named `name` — this is the case the old
// `String(value)` / `value.name` code rendered as a raw UUID.
const customTarget = makeTarget([{ id: 'c-title', name: 'title' }], 'c-title');

describe('resolveRoadmapRelationLabel', () => {
  it('resolves a plain-text labelIdentifier (e.g. company name)', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: { id: 'rec-1', name: 'Acme Corp' },
        targetObjectMetadataItem: companyTarget,
      }),
    ).toBe('Acme Corp');
  });

  it('resolves a FULL_NAME labelIdentifier (e.g. person name)', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: { id: 'rec-2', name: { firstName: 'Jane', lastName: 'Doe' } },
        targetObjectMetadataItem: personTarget,
      }),
    ).toBe('Jane Doe');
  });

  it('resolves a non-`name` labelIdentifier field', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: { id: 'rec-3', title: 'Q3 Launch' },
        targetObjectMetadataItem: customTarget,
      }),
    ).toBe('Q3 Launch');
  });

  it('falls back to the related id when no label value resolves', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: { id: 'rec-4' },
        targetObjectMetadataItem: companyTarget,
      }),
    ).toBe('rec-4');
  });

  it('returns null for empty / non-object relation values', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: null,
        targetObjectMetadataItem: companyTarget,
      }),
    ).toBeNull();
    expect(
      resolveRoadmapRelationLabel({
        rawValue: undefined,
        targetObjectMetadataItem: companyTarget,
      }),
    ).toBeNull();
  });

  it('defaults to the `name` field when the target metadata is unknown', () => {
    expect(
      resolveRoadmapRelationLabel({
        rawValue: { id: 'rec-5', name: 'Fallback Co' },
        targetObjectMetadataItem: undefined,
      }),
    ).toBe('Fallback Co');
  });
});
