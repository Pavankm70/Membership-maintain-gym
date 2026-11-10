package com.gymsphere.controller;

import com.gymsphere.dto.DatabaseExplorerDto;
import com.gymsphere.service.DatabaseExplorerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/explorer")
public class DatabaseExplorerController {

    private final DatabaseExplorerService explorerService;

    public DatabaseExplorerController(DatabaseExplorerService explorerService) {
        this.explorerService = explorerService;
    }

    @GetMapping("/tables")
    public ResponseEntity<List<DatabaseExplorerDto.TableSummary>> getTablesSummary() {
        return ResponseEntity.ok(explorerService.getTablesSummary());
    }

    @GetMapping("/tables/{tableName}/data")
    public ResponseEntity<Map<String, Object>> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(explorerService.getTableData(tableName, page, size));
    }

    @GetMapping("/tables/{tableName}/structure")
    public ResponseEntity<DatabaseExplorerDto.TableStructure> getTableStructure(@PathVariable String tableName) {
        return ResponseEntity.ok(explorerService.getTableStructure(tableName));
    }

    @GetMapping("/relationships")
    public ResponseEntity<List<DatabaseExplorerDto.RelationshipInfo>> getRelationships() {
        return ResponseEntity.ok(explorerService.getRelationships());
    }

    @GetMapping("/sql-lab/queries")
    public ResponseEntity<List<DatabaseExplorerDto.SqlDemoQuery>> getSqlLabQueries() {
        return ResponseEntity.ok(explorerService.getDemoQueries());
    }

    @PostMapping("/sql-lab/execute/{queryId}")
    public ResponseEntity<DatabaseExplorerDto.SqlExecutionResult> executeSqlLabQuery(@PathVariable String queryId) {
        return ResponseEntity.ok(explorerService.executeDemoQuery(queryId));
    }
}
