# Activity tracking

Activity tracking is a personal history of logged activities, organized by activity names and categories.

## Language

**Activity entry**:
One logged occurrence of an activity on a calendar date, optionally including a description, intensity, and time spent. Multiple entries on the same date remain distinct occurrences.
_Avoid_: Activity type, category

**Activity name**:
The shared name identifying an activity across its entries, such as Running or Yoga. A name can belong to one category or be uncategorized.
_Avoid_: Entry, category name

**Category**:
A named grouping of activity names with a description and an active or inactive designation. Membership applies to the full history of each activity name.
_Avoid_: Activity name, individual workout

**Uncategorized activity name**:
An activity name that has entries but does not belong to a category.
_Avoid_: Deleted activity

**Rename**:
A change to an activity name across its full history that preserves its category membership.
_Avoid_: Merge, edit entry

**Merge**:
An explicitly confirmed move of one activity name's full history into an existing activity name and its category membership. Every activity entry and its details are retained; the source name is removed without moving unrelated names from its category.
_Avoid_: Deduplication, category migration

**Reassignment**:
A move of an activity name, or all names in a source category, to another category without changing the names or deleting entries.
_Avoid_: Rename, merge

**Backup**:
A copy of a user's activity entries, categories, and preferences that can be restored together.
_Avoid_: Chart export, filtered activity list

**Restore**:
Replacement of the current activity history, categories, and preferences with a backup.
_Avoid_: Merge, append
