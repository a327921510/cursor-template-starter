import { useCallback, useMemo, useState } from "react";
import { App } from "antd";
import type {
  ApiEndpoint,
  ApiVersion,
  Filters,
  FormModalState,
  GroupMode,
  TesterDrawerState,
  TrendGranularity,
  TrendRange,
} from "./types";
import { ALL_STATUSES, DEFAULT_PAGE_SIZE } from "./constants";
import { useApiEndpoints } from "./hooks/useApiEndpoints";
import { useApiDetail } from "./hooks/useApiDetail";
import { useApiStats } from "./hooks/useApiStats";
import { useApiTrends } from "./hooks/useApiTrends";
import { useApiVersions } from "./hooks/useApiVersions";
import { useApiPermissions } from "./hooks/useApiPermissions";
import { useApiTester } from "./hooks/useApiTester";
import { useServices } from "./hooks/useServices";
import { useTags } from "./hooks/useTags";
import { useSelection } from "./hooks/useSelection";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { TopToolbar } from "./components/TopToolbar";
import { GroupNavigator } from "./components/GroupNavigator";
import { StatsRow } from "./components/StatsRow";
import { ApiTable } from "./components/ApiTable";
import { TrendChart } from "./components/TrendChart";
import { ApiDetailPanel } from "./components/ApiDetailPanel";
import { StatusBar } from "./components/StatusBar";
import { ApiFormModal } from "./components/ApiFormModal";
import type { ApiFormValues } from "./components/ApiFormModal";
import { ApiTesterDrawer } from "./components/ApiTesterDrawer";

const DEFAULT_FILTERS: Filters = { search: "", statuses: ALL_STATUSES, sort: "updatedAt-desc" };

export function ApiDashboardPage() {
  const { message, modal } = App.useApp();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [groupMode, setGroupMode] = useState<GroupMode>("service");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formModal, setFormModal] = useState<FormModalState>({ open: false });
  const [testerDrawer, setTesterDrawer] = useState<TesterDrawerState>({ open: false });
  const [trendRange, setTrendRange] = useState<TrendRange>("7d");
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("day");

  const { selectedId, selectedIds, select, toggleMulti, selectAll, clearAll } = useSelection();

  const endpoints = useApiEndpoints({ filters, groupId: selectedGroupId, page, pageSize });
  const detail = useApiDetail(selectedId);
  const stats = useApiStats();
  const trends = useApiTrends({ apiId: selectedId, range: trendRange, granularity: trendGranularity });
  const versions = useApiVersions(selectedId);
  const apiPermissions = useApiPermissions(selectedId, detail.detail?.permissions ?? []);
  const tester = useApiTester(testerDrawer.apiId ?? null);
  const { services } = useServices();
  const { tags } = useTags();
  const lastSyncTime = useMemo(() => new Date().toLocaleTimeString(), []);

  const autoRefresh = useAutoRefresh(() => {
    endpoints.refetch();
    stats.refetch();
  });

  const handleFiltersChange = useCallback((partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const handleGroupSelect = useCallback((id: string | null) => {
    setSelectedGroupId(id);
    clearAll();
    setPage(1);
  }, [clearAll]);

  const handlePageChange = useCallback((p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      modal.confirm({
        title: "Delete API",
        content: "Are you sure you want to delete this API? This action cannot be undone.",
        okText: "Delete",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await endpoints.deleteEndpoint(id);
            if (selectedId === id) select(null);
            message.success("API deleted");
          } catch {
            message.error("Failed to delete API");
          }
        },
      });
    },
    [endpoints, selectedId, select, message, modal],
  );

  const handleEdit = useCallback((id: string) => {
    setFormModal({ open: true, editId: id });
  }, []);

  const handleFormSubmit = useCallback(
    async (values: ApiFormValues) => {
      if (formModal.editId) {
        await endpoints.updateEndpoint(formModal.editId, values as unknown as Partial<ApiEndpoint>);
        message.success("API updated");
      } else {
        const created = await endpoints.createEndpoint(values as unknown as Partial<ApiEndpoint>);
        select(created.id);
        message.success("API created");
      }
      setFormModal({ open: false });
    },
    [formModal.editId, endpoints, select, message],
  );

  const handleSaveDraft = useCallback(
    async (values: ApiFormValues) => {
      const data = { ...values, status: "draft" } as unknown as Partial<ApiEndpoint>;
      if (formModal.editId) {
        await endpoints.updateEndpoint(formModal.editId, data);
      } else {
        await endpoints.createEndpoint(data);
      }
      message.success("Draft saved");
      setFormModal({ open: false });
    },
    [formModal.editId, endpoints, message],
  );

  const handleExport = useCallback((_format: "json" | "csv" | "openapi") => {
    message.info("Export started...");
  }, [message]);

  const handleCopyPath = useCallback(
    (path: string) => {
      navigator.clipboard.writeText(path).then(() => message.success("Path copied"));
    },
    [message],
  );

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedGroupId(null);
    setPage(1);
  }, []);

  const editingApi = useMemo(
    () => (formModal.editId ? endpoints.endpoints.find((e) => e.id === formModal.editId) ?? null : null),
    [formModal.editId, endpoints.endpoints],
  );

  const testerApi = useMemo(
    () => (testerDrawer.apiId ? endpoints.endpoints.find((e) => e.id === testerDrawer.apiId) ?? null : null),
    [testerDrawer.apiId, endpoints.endpoints],
  );

  const errorCount = useMemo(
    () => endpoints.endpoints.filter((e) => e.status === "error").length,
    [endpoints.endpoints],
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
          services={services}
          tags={tags}
          groupMode={groupMode}
          selectedGroupId={selectedGroupId}
          onGroupModeChange={setGroupMode}
          onGroupSelect={handleGroupSelect}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <StatsRow
            stats={stats.stats}
            isLoading={stats.loading}
            onFilterByStatus={handleFiltersChange}
          />

          <ApiTable
            endpoints={endpoints.endpoints}
            total={endpoints.total}
            page={page}
            pageSize={pageSize}
            loading={endpoints.loading}
            searchKeyword={filters.search}
            selectedId={selectedId}
            selectedIds={selectedIds}
            onSelect={select}
            onToggleMulti={toggleMulti}
            onSelectAll={selectAll}
            onClearSelection={clearAll}
            onPageChange={handlePageChange}
            onToggleFavorite={endpoints.toggleFavorite}
            onEdit={handleEdit}
            onCopy={(id) => message.info(`Duplicating API ${id}...`)}
            onDelete={handleDelete}
            onDeprecate={(id) =>
              endpoints.updateEndpoint(id, { status: "deprecated" } as Partial<ApiEndpoint>)
            }
            onViewDocs={(id) => window.open(`/docs/api/${id}`, "_blank")}
            onViewLogs={(id) => window.open(`/logs?apiId=${id}`, "_blank")}
            onBatchDeprecate={() => endpoints.batchAction("deprecate", selectedIds)}
            onBatchDelete={() => endpoints.batchAction("delete", selectedIds).then(clearAll)}
            onBatchTag={() => message.info("Tag selection coming soon")}
            onBatchExport={() => handleExport("json")}
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

        <div className="w-80 flex-shrink-0 border-l">
          <ApiDetailPanel
            api={detail.detail}
            loading={detail.loading}
            versions={versions.versions}
            versionsLoading={versions.loading}
            permissions={apiPermissions.permissions}
            onEdit={handleEdit}
            onTest={(id) => setTesterDrawer({ open: true, apiId: id })}
            onDelete={handleDelete}
            onCopyPath={handleCopyPath}
            onViewDocs={(id) => window.open(`/docs/api/${id}`, "_blank")}
            onViewDiff={(_version: ApiVersion) => message.info("Diff viewer coming soon")}
            onViewAllVersions={() => message.info("All versions coming soon")}
            onRemovePermission={apiPermissions.removePermission}
          />
        </div>
      </div>

      <StatusBar
        lastSyncTime={lastSyncTime}
        filteredCount={endpoints.endpoints.length}
        totalCount={endpoints.total}
        errorCount={errorCount}
        autoRefreshEnabled={autoRefresh.enabled}
        autoRefreshInterval={autoRefresh.interval}
        onToggleAutoRefresh={autoRefresh.toggleEnabled}
        onChangeInterval={autoRefresh.setRefreshInterval}
        onManualRefresh={autoRefresh.manualRefresh}
      />

      <ApiFormModal
        open={formModal.open}
        editingApi={editingApi}
        services={services}
        tags={tags}
        onSubmit={handleFormSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={() => setFormModal({ open: false })}
      />

      <ApiTesterDrawer
        open={testerDrawer.open}
        api={testerApi}
        response={tester.response}
        loading={tester.loading}
        error={tester.error}
        onSendRequest={tester.sendRequest}
        onClose={() => {
          setTesterDrawer({ open: false });
          tester.reset();
        }}
      />
    </div>
  );
}

export default ApiDashboardPage;
