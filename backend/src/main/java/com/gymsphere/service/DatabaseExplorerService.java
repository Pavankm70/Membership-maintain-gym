package com.gymsphere.service;

import com.gymsphere.dto.DatabaseExplorerDto;
import com.gymsphere.exception.BadRequestException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DatabaseExplorerService {

    private final JdbcTemplate jdbcTemplate;

    private static final List<String> ALLOWED_TABLES = List.of(
            "members", "trainers", "membership_plans", "subscriptions", "payments", "attendance", "users"
    );

    private final Map<String, DatabaseExplorerDto.SqlDemoQuery> queryAllowlist = new LinkedHashMap<>();

    public DatabaseExplorerService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initSqlDemoQueries();
    }

    private void initSqlDemoQueries() {
        registerQuery(
                "q_select_members",
                "Basic CRUD & SELECT",
                "Active Members Directory",
                "Retrieves active gym members sorted by their join date. Demonstrates WHERE filtering and ORDER BY.",
                "SELECT member_id, full_name, email, phone, gender, join_date, status FROM members WHERE status = 'ACTIVE' ORDER BY join_date DESC;"
        );

        registerQuery(
                "q_inner_join_subs",
                "Joins & Relationships",
                "Active Subscriptions with Member & Plan Details (INNER JOIN)",
                "Performs an INNER JOIN across members, subscriptions, and membership_plans to produce an active roster.",
                "SELECT s.subscription_id, m.full_name AS member_name, p.plan_name, s.start_date, s.end_date, s.amount_at_purchase " +
                "FROM subscriptions s " +
                "INNER JOIN members m ON s.member_id = m.member_id " +
                "INNER JOIN membership_plans p ON s.plan_id = p.plan_id " +
                "WHERE s.status = 'ACTIVE' ORDER BY s.end_date ASC;"
        );

        registerQuery(
                "q_left_join_trainers",
                "Joins & Relationships",
                "Trainers & Assigned Subscriptions (LEFT JOIN)",
                "Preserves all trainers even if they currently have no active member subscriptions assigned. Demonstrates outer join behavior.",
                "SELECT t.trainer_id, t.full_name AS trainer_name, t.specialization, COUNT(s.subscription_id) AS active_clients " +
                "FROM trainers t " +
                "LEFT JOIN subscriptions s ON t.trainer_id = s.trainer_id AND s.status = 'ACTIVE' " +
                "GROUP BY t.trainer_id, t.full_name, t.specialization " +
                "ORDER BY active_clients DESC;"
        );

        registerQuery(
                "q_group_by_having",
                "Aggregation & Grouping",
                "Frequent Visitors (GROUP BY & HAVING >= 3 visits)",
                "Groups attendance check-ins by member and uses the HAVING clause to filter groups with at least 3 gym visits.",
                "SELECT m.member_id, m.full_name, m.email, COUNT(a.attendance_id) AS total_visits " +
                "FROM members m " +
                "JOIN attendance a ON m.member_id = a.member_id " +
                "GROUP BY m.member_id, m.full_name, m.email " +
                "HAVING COUNT(a.attendance_id) >= 3 " +
                "ORDER BY total_visits DESC;"
        );

        registerQuery(
                "q_aggregate_metrics",
                "Aggregation & Grouping",
                "Financial Ledger Statistics (COUNT, SUM, AVG, MIN, MAX)",
                "Calculates cumulative revenue, average ticket size, and payment metrics from successful transactions.",
                "SELECT COUNT(payment_id) AS total_successful_payments, " +
                "       SUM(amount) AS total_revenue_collected, " +
                "       ROUND(AVG(amount), 2) AS average_payment, " +
                "       MIN(amount) AS min_payment, " +
                "       MAX(amount) AS max_payment " +
                "FROM payments WHERE payment_status = 'SUCCESS';"
        );

        registerQuery(
                "q_subquery_above_avg",
                "Subqueries",
                "Above-Average Transactions (Scalar Subquery)",
                "Uses an inner subquery to find payments whose amounts exceed the system-wide average transaction value.",
                "SELECT payment_id, subscription_id, amount, payment_method, payment_date " +
                "FROM payments " +
                "WHERE amount > (SELECT AVG(amount) FROM payments WHERE payment_status = 'SUCCESS') " +
                "  AND payment_status = 'SUCCESS' " +
                "ORDER BY amount DESC;"
        );

        registerQuery(
                "q_subquery_in_trainers",
                "Subqueries",
                "Members with Personal Trainer Subscriptions (IN Subquery)",
                "Identifies members enrolled in premium personal training using an IN subquery against the subscriptions table.",
                "SELECT member_id, full_name, email, phone " +
                "FROM members " +
                "WHERE member_id IN (SELECT DISTINCT member_id FROM subscriptions WHERE trainer_id IS NOT NULL AND status = 'ACTIVE');"
        );

        registerQuery(
                "q_monthly_revenue",
                "Reports & Analytics",
                "Monthly Revenue & Transaction Breakdown",
                "Demonstrates DATE_FORMAT grouping and conditional aggregation to separate collected vs pending income.",
                "SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month, " +
                "       COUNT(payment_id) AS total_txns, " +
                "       SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END) AS collected_revenue " +
                "FROM payments " +
                "GROUP BY DATE_FORMAT(payment_date, '%Y-%m') " +
                "ORDER BY month DESC;"
        );

        registerQuery(
                "q_view_active_members",
                "Views & Virtual Tables",
                "Active Member Details View (view_active_member_details)",
                "Queries the pre-compiled database VIEW that flattens members, plans, days remaining, and assigned trainers.",
                "SELECT member_name, plan_name, days_remaining, trainer_name, amount_at_purchase " +
                "FROM view_active_member_details " +
                "ORDER BY days_remaining ASC;"
        );
    }

    private void registerQuery(String id, String category, String title, String explanation, String sql) {
        queryAllowlist.put(id, new DatabaseExplorerDto.SqlDemoQuery(id, category, title, explanation, sql));
    }

    public List<DatabaseExplorerDto.TableSummary> getTablesSummary() {
        List<DatabaseExplorerDto.TableSummary> result = new ArrayList<>();
        for (String table : ALLOWED_TABLES) {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
            Integer cols = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                    Integer.class,
                    table
            );
            result.add(new DatabaseExplorerDto.TableSummary(table, count != null ? count : 0, cols != null ? cols : 0));
        }
        return result;
    }

    public Map<String, Object> getTableData(String tableName, int page, int size) {
        validateTableName(tableName);
        int offset = Math.max(0, page) * size;

        Long totalCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT * FROM " + tableName + " LIMIT ? OFFSET ?",
                size, offset
        );

        // Sanitize sensitive user password hashes if viewing users table in Explorer
        if ("users".equalsIgnoreCase(tableName)) {
            for (Map<String, Object> row : rows) {
                if (row.containsKey("password_hash")) {
                    row.put("password_hash", "[PROTECTED BCRYPT HASH]");
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("tableName", tableName);
        response.put("totalRecords", totalCount != null ? totalCount : 0);
        response.put("page", page);
        response.put("size", size);
        response.put("rows", rows);
        return response;
    }

    public DatabaseExplorerDto.TableStructure getTableStructure(String tableName) {
        validateTableName(tableName);

        // Retrieve Columns from INFORMATION_SCHEMA.COLUMNS
        String colSql = "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA " +
                "FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? " +
                "ORDER BY ORDINAL_POSITION";

        // Retrieve Foreign Keys from INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        String fkSql = "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
                "FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL";

        Map<String, String[]> fkMap = new HashMap<>();
        jdbcTemplate.query(fkSql, rs -> {
            fkMap.put(rs.getString("COLUMN_NAME"),
                    new String[]{rs.getString("REFERENCED_TABLE_NAME"), rs.getString("REFERENCED_COLUMN_NAME")});
        }, tableName);

        List<DatabaseExplorerDto.ColumnInfo> columns = new ArrayList<>();
        jdbcTemplate.query(colSql, rs -> {
            DatabaseExplorerDto.ColumnInfo col = new DatabaseExplorerDto.ColumnInfo();
            String name = rs.getString("COLUMN_NAME");
            col.setColumnName(name);
            col.setDataType(rs.getString("COLUMN_TYPE"));
            col.setNullable("YES".equalsIgnoreCase(rs.getString("IS_NULLABLE")));
            col.setPrimaryKey("PRI".equalsIgnoreCase(rs.getString("COLUMN_KEY")));
            col.setUnique("UNI".equalsIgnoreCase(rs.getString("COLUMN_KEY")));
            col.setDefaultValue(rs.getString("COLUMN_DEFAULT"));
            col.setExtra(rs.getString("EXTRA"));

            if (fkMap.containsKey(name)) {
                col.setForeignKey(true);
                col.setReferencedTable(fkMap.get(name)[0]);
                col.setReferencedColumn(fkMap.get(name)[1]);
            } else {
                col.setForeignKey(false);
            }

            columns.add(col);
        }, tableName);

        // Retrieve Index Information
        String idxSql = "SHOW INDEX FROM " + tableName;
        List<Map<String, Object>> indexList = jdbcTemplate.queryForList(idxSql);

        return new DatabaseExplorerDto.TableStructure(tableName, columns, indexList);
    }

    public List<DatabaseExplorerDto.RelationshipInfo> getRelationships() {
        List<DatabaseExplorerDto.RelationshipInfo> rels = new ArrayList<>();

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "fk_sub_member", "subscriptions", "member_id", "members", "member_id",
                "Many-to-One (1:N)", false, "CASCADE", "RESTRICT",
                "Every subscription is owned by exactly one gym member. Members with active subscriptions cannot be deleted."
        ));

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "fk_sub_plan", "subscriptions", "plan_id", "membership_plans", "plan_id",
                "Many-to-One (1:N)", false, "CASCADE", "RESTRICT",
                "Links subscription to a defined package. Preserves plan definitions while subscriptions are active."
        ));

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "fk_sub_trainer", "subscriptions", "trainer_id", "trainers", "trainer_id",
                "Many-to-One (0..1:N)", true, "CASCADE", "SET NULL",
                "Personal trainer mentoring is optional. If trainer leaves, trainer_id is safely set to NULL without destroying subscription."
        ));

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "fk_pay_subscription", "payments", "subscription_id", "subscriptions", "subscription_id",
                "Many-to-One (1:N)", false, "CASCADE", "RESTRICT",
                "Payments record transactions against subscriptions. Prevents deleting subscriptions with financial audit trail."
        ));

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "fk_att_member", "attendance", "member_id", "members", "member_id",
                "Many-to-One (1:N)", false, "CASCADE", "CASCADE",
                "Tracks daily attendance sessions. If a member is purged, their physical attendance logs cascade."
        ));

        rels.add(new DatabaseExplorerDto.RelationshipInfo(
                "none (independent)", "users", "N/A", "N/A", "N/A",
                "Decoupled Entity", false, "N/A", "N/A",
                "Administrative and staff credentials are isolated from gym member accounts for RBAC and security isolation."
        ));

        return rels;
    }

    public List<DatabaseExplorerDto.SqlDemoQuery> getDemoQueries() {
        return new ArrayList<>(queryAllowlist.values());
    }

    public DatabaseExplorerDto.SqlExecutionResult executeDemoQuery(String queryId) {
        DatabaseExplorerDto.SqlDemoQuery demo = queryAllowlist.get(queryId);
        if (demo == null) {
            throw new BadRequestException("Unknown demo query ID: " + queryId);
        }

        DatabaseExplorerDto.SqlExecutionResult result = new DatabaseExplorerDto.SqlExecutionResult();
        result.setQueryId(queryId);
        result.setExecutedSql(demo.getSql());

        long start = System.currentTimeMillis();
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(demo.getSql());
            result.setExecutionTimeMs(System.currentTimeMillis() - start);
            result.setRows(rows);
            result.setRowCount(rows.size());
            if (!rows.isEmpty()) {
                result.setColumns(new ArrayList<>(rows.get(0).keySet()));
            } else {
                result.setColumns(Collections.emptyList());
            }
        } catch (Exception ex) {
            result.setError("SQL Execution Error: " + ex.getMessage());
            result.setExecutionTimeMs(System.currentTimeMillis() - start);
        }

        return result;
    }

    private void validateTableName(String table) {
        if (!ALLOWED_TABLES.contains(table.toLowerCase().trim())) {
            throw new BadRequestException("Invalid or disallowed table: " + table);
        }
    }
}
