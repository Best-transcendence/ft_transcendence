# Elasticsearch ILM Policy - Documentation

## INDEX LIFECYCLE MANAGEMENT (ILM) POLICY

This policy automatically manages log retention to prevent unlimited growth.

### HOT PHASE (Active logs)
- Logs are actively written and searched
- When index reaches 1GB OR 1 day old → rollover to new index
- Keeps recent logs fast and accessible

**Configuration:**
- `max_size: "1GB"` - Create new index when current reaches 1GB
- `max_age: "1d"` - Or after 1 day, whichever comes first

### DELETE PHASE (Cleanup)
- After 7 days, old indices are automatically deleted
- Prevents disk space from filling up
- Balances between keeping useful history and storage limits

**Configuration:**
- `min_age: "7d"` - Wait 7 days before deleting
- `actions: { "delete": {} }` - Delete old indices to free space

## How It Works

1. **Daily Indices**: Logs are stored in daily indices (e.g., `logs-2025.01.15`)
2. **Rollover**: When an index reaches 1GB or becomes 1 day old, a new index is created
3. **Retention**: After 7 days, old indices are automatically deleted
4. **Storage Management**: This prevents unlimited disk space usage while keeping recent logs accessible

## Benefits

- **Automatic Management**: No manual intervention needed
- **Storage Efficiency**: Old logs are automatically cleaned up
- **Performance**: Recent logs stay in "hot" phase for fast access
- **Cost Control**: Prevents disk space from filling up indefinitely

