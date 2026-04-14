import { useCallback, useMemo, useRef, useState } from "react";
import { Modal, message } from "antd";
import type {
  Filters,
  GroupMode,
  TrendRange,
  TrendGranularity,
  ExportFormat,
  FormModalState,
  TesterDrawerState,
  ApiEndpoint,
} from "./types";
import { ALL_STATUSES, DEFAULT_PAGE_SIZE } from "./constants";
import { useApiEndpoints } from "./hooks/useApiEndpoints";
import { useApiDetail } from "./hooks/useApiDetail";
import { useApiStats } from "./hooks/useApiStats";
import { useApiTrends } from "./hooks/useApiTrends";
import { useServices } from "./hooks/useServices";
import { useTags } from "./hooks/useTags";
import { useSelection } from "./hooks/useSelection";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import { TopToolbar } from "./components/TopToolbar";
import { GroupNavigator } from "./components/GroupNavigator";
import { StatsRow } from "./components/StatsRow";
import { ApiTable } from "./components/ApiTable";
import { TrendChart } from "./components/TrendChart";
import { ApiDetailPanel } from "./components/ApiDetailPanel";
import { StatusBar } from "./components/StatusBar";
import { ApiFormModal } from "./components/ApiFormModal";
import { ApiTesterDrawer } from "./components/ApiTesterDrawer";

export function ApiDashboardPage() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    statuses: [...ALL_STATUSES],
    sortField: "updatedAt-desc",
  });
  const [groupMode, setGroupMode] = useState<GroupMode>("service");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formModal, setFormModal] = useState<FormModalState>({ open: false });
  const [testerDrawer, setTesterDrawer] = useState<TesterDrawerState>({ open: false });
  const [trendRange, setTrendRange] = useState<TrendRange>("7d");
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("day");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const recentApisRef = useRef<{ id: string; name: string }[]>([]);

  const {
    selectedId,
    selectedIds,
    select,
    toggleMulti,
    selectAll,
    clearAll,
  } = useSelection();

  const endpoints = useApiEndpoints({ filters, groupId: selectedGroupId, page, pageSize });
  const { detail, loading: detailLoading } = useApiDetail(selectedId);
  const stats = useApiStats();
  const trends = useApiTrends({ apiId: selectedId, range: trendRange, granularity: trendGranularity });
  const { services } = useServices();
  const { tags } = useTags();

  const handleRefreshAll = useCallback(() => {
    endpoints.refetch();
    stats.refetch();
    trends.refetch();
    setLastSyncTime(new Date().toLocaleTimeString());
  }, [endpoints, stats, trends]);

  const autoRefresh = useAutoRefresh(handleRefreshAll);

  const handleSelect = useCallback(
    (id: string | null) => {
      select(id);
      if (id) {
        const ep = endpoints.endpoints.find((e) => e.id === id);
        if (ep) {
          recentApisRef.current = [
            { id: ep.id, name: ep.name },
            ...recentApisRef.current.filter((r) => r.id !== id),
          ].slice(0, 3);
        }
      }
    },
    [select, endpoints.endpoints],
  );

  const handleGroupSelect = useCallback(
    (groupId: string | null) => {
      setSelectedGroupId(groupId);
      clearAll();
      setPage(1);
    },
    [clearAll],
  );

  const handleStatsClick = useCallback((filter: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...filter }));
    setPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      Modal.confirm({
        title: "Delete API",
        content: "Are you sure you want to delete this API? This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
        onOk: async () => {
          await endpoints.deleteEndpoint(id);
          if (selectedId === id) select(null);
          message.success("API deleted");
        },
      });
    },
    [endpoints, selectedId, select],
  );

  const handleEdit = useCallback((id: string) => {
    setFormModal({ open: true, editId: id });
  }, []);

  const handleCopy = useCallback(
    async (id: string) => {
      const ep = endpoints.endpoints.find((e) => e.id === id);
      if (ep) {
        try {
          await apiDashboardApi.createEndpoint({
            ...ep,
            id: undefined as unknown as string,
            name: `${ep.name} (Copy)`,
            status: "draft",
          });
          endpoints.refetch();
          message.success("API duplicated as draft");
        } catch {
          message.error("Failed to duplicate API");
        }
      }
    },
    [endpoints],
  );

  const handleDeprecate = useCallback(
    async (id: string) => {
      const ep = endpoints.endpoints.find((e) => e.id === id);
      if (ep) {
        const newStatus = ep.status === "deprecated" ? "active" : "deprecated";
        await apiDashboardApi.updateEndpoint(id, { status: newStatus });
        endpoints.refetch();
      }
    },
    [endpoints],
  );

  const handleFormSubmit = useCallback(
    async (data: Partial<ApiEndpoint>) => {
      if (formModal.editId) {
        await apiDashboardApi.updateEndpoint(formModal.editId, data);
      } else {
        await apiDashboardApi.createEndpoint(data);
      }
      endpoints.refetch();
      setFormModal({ open: false });
    },
    [formModal.editId, endpoints],
  );

  const handleFormSaveDraft = useCallback(
    async (data: Partial<ApiEndpoint>) => {
      await apiDashboardApi.createEndpoint({ ...data, status: "draft" });
      endpoints.refetch();
      setFormModal({ open: false });
    },
    [endpoints],
  );

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      try {
        await apiDashboardApi.exportEndpoints({
          format,
          ids: selectedIds.length > 0 ? selectedIds : undefined,
        });
        message.success("Export started");
      } catch {
        message.error("Export failed");
      }
    },
    [selectedIds],
  );

  const handleBatchDeprecate = useCallback(async () => {
    await endpoints.batchAction("deprecate", selectedIds);
    clearAll();
  }, [endpoints, selectedIds, clearAll]);

  const handleBatchDelete = useCallback(() => {
    Modal.confirm({
      title: `Delete ${selectedIds.length} APIs`,
      content: "This action cannot be undone.",
      okText: "Delete All",
      okType: "danger",
      onOk: async () => {
        await endpoints.batchAction("delete", selectedIds);
        clearAll();
      },
    });
  }, [endpoints, selectedIds, clearAll]);

  const handleBatchTag = useCallback(async () => {
    message.info("Batch tagging coming soon");
  }, []);

  const handleBatchExport = useCallback(() => {
    handleExport("json");
  }, [handleExport]);

  const handleTest = useCallback((apiId: string) => {
    setTesterDrawer({ open: true, apiId });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: "", statuses: [...ALL_STATUSES], sortField: "updatedAt-desc" });
    setSelectedGroupId(null);
    setPage(1);
  }, []);

  const editingApi = useMemo(
    () => (formModal.editId ? endpoints.endpoints.find((e) => e.id === formModal.editId) ?? null : null),
    [formModal.editId, endpoints.endpoints],
  );

  const testerApi = useMemo(
    () => (testerDrawer.apiId ? endpoints.endpoints.find((e) => e.id === testerDrawer.apiId) ?? detail : null),
    [testerDrawer.apiId, endpoints.endpoints, detail],
  );

  return (
    <div className="flex h-full flex-col">
      <TopToolbar
        filters={filters}
        groupMode={groupMode}
        onFiltersChange={handleFiltersChange}
        onGroupModeChange={setGroupMode}
        onCreateNew={() => setFormModal({ open: true })}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden">
        <GroupNavigator
          endpoints={endpoints.endpoints}
          groupMode={groupMode}
          selectedGroupId={selectedGroupId}
          onGroupModeChange={setGroupMode}
          onGroupSelect={handleGroupSelect}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <StatsRow
            stats={stats.stats}
            loading={stats.loading}
            onStatsClick={handleStatsClick}
          />

          <ApiTable
            endpoints={endpoints.endpoints}
            total={endpoints.total}
            loading={endpoints.loading}
            page={page}
            pageSize={pageSize}
            selectedId={selectedId}
            selectedIds={selectedIds}
            searchKeyword={filters.search}
            onSelect={handleSelect}
            onToggleMulti={toggleMulti}
            onSelectAll={selectAll}
            onClearSelection={clearAll}
            onPageChange={handlePageChange}
            onToggleFavorite={endpoints.toggleFavorite}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onDeprecate={handleDeprecate}
            onBatchDeprecate={handleBatchDeprecate}
            onBatchDelete={handleBatchDelete}
            onBatchTag={handleBatchTag}
            onBatchExport={handleBatchExport}
            onClearFilters={handleClearFilters}
          />

          <TrendChart
            data={trends.data}
            loading={trends.loading}
            range={trendRange}
            granularity={trendGranularity}
            onRangeChange={setTrendRange}
            onGranularityChange={setTrendGranularity}
          />
        </main>

        <ApiDetailPanel
          detail={detail}
          loading={detailLoading}
          onEdit={handleEdit}
          onTest={handleTest}
          onDelete={handleDelete}
          recentApis={recentApisRef.current}
          onSelectRecent={handleSelect}
        />
      </div>

      <StatusBar
        lastSyncTime={lastSyncTime}
        filteredCount={endpoints.total}
        totalCount={stats.stats.totalApis}
        errorCount={stats.stats.errorApis}
        autoRefreshEnabled={autoRefresh.enabled}
        autoRefreshInterval={autoRefresh.interval}
        onToggleAutoRefresh={autoRefresh.toggle}
        onIntervalChange={autoRefresh.setInterval}
        onManualRefresh={handleRefreshAll}
      />

      <ApiFormModal
        open={formModal.open}
        editingApi={editingApi}
        services={services}
        tags={tags}
        onSubmit={handleFormSubmit}
        onSaveDraft={handleFormSaveDraft}
        onClose={() => setFormModal({ open: false })}
      />

      <ApiTesterDrawer
        open={testerDrawer.open}
        api={testerApi}
        onClose={() => setTesterDrawer({ open: false })}
      />
    </div>
  );
}

export default ApiDashboardPage;
