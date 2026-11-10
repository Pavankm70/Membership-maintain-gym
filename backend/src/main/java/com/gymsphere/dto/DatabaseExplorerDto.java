package com.gymsphere.dto;

import java.util.List;
import java.util.Map;

public class DatabaseExplorerDto {

    public static class TableSummary {
        private String tableName;
        private long rowCount;
        private int columnCount;

        public TableSummary() {
        }

        public TableSummary(String tableName, long rowCount, int columnCount) {
            this.tableName = tableName;
            this.rowCount = rowCount;
            this.columnCount = columnCount;
        }

        public String getTableName() {
            return tableName;
        }

        public void setTableName(String tableName) {
            this.tableName = tableName;
        }

        public long getRowCount() {
            return rowCount;
        }

        public void setRowCount(long rowCount) {
            this.rowCount = rowCount;
        }

        public int getColumnCount() {
            return columnCount;
        }

        public void setColumnCount(int columnCount) {
            this.columnCount = columnCount;
        }
    }

    public static class ColumnInfo {
        private String columnName;
        private String dataType;
        private boolean isNullable;
        private boolean isPrimaryKey;
        private boolean isForeignKey;
        private String referencedTable;
        private String referencedColumn;
        private boolean isUnique;
        private String defaultValue;
        private String extra;

        public ColumnInfo() {
        }

        public String getColumnName() {
            return columnName;
        }

        public void setColumnName(String columnName) {
            this.columnName = columnName;
        }

        public String getDataType() {
            return dataType;
        }

        public void setDataType(String dataType) {
            this.dataType = dataType;
        }

        public boolean isNullable() {
            return isNullable;
        }

        public void setNullable(boolean nullable) {
            isNullable = nullable;
        }

        public boolean isPrimaryKey() {
            return isPrimaryKey;
        }

        public void setPrimaryKey(boolean primaryKey) {
            isPrimaryKey = primaryKey;
        }

        public boolean isForeignKey() {
            return isForeignKey;
        }

        public void setForeignKey(boolean foreignKey) {
            isForeignKey = foreignKey;
        }

        public String getReferencedTable() {
            return referencedTable;
        }

        public void setReferencedTable(String referencedTable) {
            this.referencedTable = referencedTable;
        }

        public String getReferencedColumn() {
            return referencedColumn;
        }

        public void setReferencedColumn(String referencedColumn) {
            this.referencedColumn = referencedColumn;
        }

        public boolean isUnique() {
            return isUnique;
        }

        public void setUnique(boolean unique) {
            isUnique = unique;
        }

        public String getDefaultValue() {
            return defaultValue;
        }

        public void setDefaultValue(String defaultValue) {
            this.defaultValue = defaultValue;
        }

        public String getExtra() {
            return extra;
        }

        public void setExtra(String extra) {
            this.extra = extra;
        }
    }

    public static class TableStructure {
        private String tableName;
        private List<ColumnInfo> columns;
        private List<Map<String, Object>> indexes;

        public TableStructure() {
        }

        public TableStructure(String tableName, List<ColumnInfo> columns, List<Map<String, Object>> indexes) {
            this.tableName = tableName;
            this.columns = columns;
            this.indexes = indexes;
        }

        public String getTableName() {
            return tableName;
        }

        public void setTableName(String tableName) {
            this.tableName = tableName;
        }

        public List<ColumnInfo> getColumns() {
            return columns;
        }

        public void setColumns(List<ColumnInfo> columns) {
            this.columns = columns;
        }

        public List<Map<String, Object>> getIndexes() {
            return indexes;
        }

        public void setIndexes(List<Map<String, Object>> indexes) {
            this.indexes = indexes;
        }
    }

    public static class RelationshipInfo {
        private String foreignKeyName;
        private String fromTable;
        private String fromColumn;
        private String toTable;
        private String toColumn;
        private String cardinality;
        private boolean isNullable;
        private String onUpdate;
        private String onDelete;
        private String description;

        public RelationshipInfo() {
        }

        public RelationshipInfo(String foreignKeyName, String fromTable, String fromColumn, String toTable, String toColumn, String cardinality, boolean isNullable, String onUpdate, String onDelete, String description) {
            this.foreignKeyName = foreignKeyName;
            this.fromTable = fromTable;
            this.fromColumn = fromColumn;
            this.toTable = toTable;
            this.toColumn = toColumn;
            this.cardinality = cardinality;
            this.isNullable = isNullable;
            this.onUpdate = onUpdate;
            this.onDelete = onDelete;
            this.description = description;
        }

        public String getForeignKeyName() {
            return foreignKeyName;
        }

        public void setForeignKeyName(String foreignKeyName) {
            this.foreignKeyName = foreignKeyName;
        }

        public String getFromTable() {
            return fromTable;
        }

        public void setFromTable(String fromTable) {
            this.fromTable = fromTable;
        }

        public String getFromColumn() {
            return fromColumn;
        }

        public void setFromColumn(String fromColumn) {
            this.fromColumn = fromColumn;
        }

        public String getToTable() {
            return toTable;
        }

        public void setToTable(String toTable) {
            this.toTable = toTable;
        }

        public String getToColumn() {
            return toColumn;
        }

        public void setToColumn(String toColumn) {
            this.toColumn = toColumn;
        }

        public String getCardinality() {
            return cardinality;
        }

        public void setCardinality(String cardinality) {
            this.cardinality = cardinality;
        }

        public boolean isNullable() {
            return isNullable;
        }

        public void setNullable(boolean nullable) {
            isNullable = nullable;
        }

        public String getOnUpdate() {
            return onUpdate;
        }

        public void setOnUpdate(String onUpdate) {
            this.onUpdate = onUpdate;
        }

        public String getOnDelete() {
            return onDelete;
        }

        public void setOnDelete(String onDelete) {
            this.onDelete = onDelete;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class SqlDemoQuery {
        private String id;
        private String category;
        private String title;
        private String explanation;
        private String sql;

        public SqlDemoQuery() {
        }

        public SqlDemoQuery(String id, String category, String title, String explanation, String sql) {
            this.id = id;
            this.category = category;
            this.title = title;
            this.explanation = explanation;
            this.sql = sql;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }

        public String getSql() {
            return sql;
        }

        public void setSql(String sql) {
            this.sql = sql;
        }
    }

    public static class SqlExecutionResult {
        private String queryId;
        private String executedSql;
        private long executionTimeMs;
        private List<String> columns;
        private List<Map<String, Object>> rows;
        private int rowCount;
        private String error;

        public SqlExecutionResult() {
        }

        public String getQueryId() {
            return queryId;
        }

        public void setQueryId(String queryId) {
            this.queryId = queryId;
        }

        public String getExecutedSql() {
            return executedSql;
        }

        public void setExecutedSql(String executedSql) {
            this.executedSql = executedSql;
        }

        public long getExecutionTimeMs() {
            return executionTimeMs;
        }

        public void setExecutionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
        }

        public List<String> getColumns() {
            return columns;
        }

        public void setColumns(List<String> columns) {
            this.columns = columns;
        }

        public List<Map<String, Object>> getRows() {
            return rows;
        }

        public void setRows(List<Map<String, Object>> rows) {
            this.rows = rows;
        }

        public int getRowCount() {
            return rowCount;
        }

        public void setRowCount(int rowCount) {
            this.rowCount = rowCount;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}
