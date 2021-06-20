<template>
  <h-page-container>
    <h-layout>
      <div ref="pageBox" class="page-box">
        <div class="page-header">
          <el-button icon="h-icon-export" :disabled="true">
            导出
          </el-button>
        </div>
        <div id="pageSearch" class="page-search">
          <el-row :gutter="16">
            <el-col :span="5">
              <div class="search-item">
                <div style="margin-bottom: 4px">时间</div>
                <el-date-picker
                  v-model="queryParams.assessBatch"
                  type="month"
                  :picker-options="queryParams.datePickerOptions"
                  placeholder="请选择月"
                />
              </div>
            </el-col>
            <el-col :span="5">
              <div class="search-btn">
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button type="default" @click="handleReset">重置</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="table-wrap">
          <el-table
            ref="tabref"
            v-loading="loading"
            :data="tableData"
            stripe
            :height="tableHeight - 196"
            enable-virtual-scroll
            force-scroll
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" />
            <el-table-column prop="assessBatch" label="考核批次" />
            <el-table-column prop="vehicleCount" label="入网车辆数" />
            <el-table-column prop="onlineRate" label="上线率">
              <template slot-scope="scope">
                <span>{{ scope.row.onlineRate }}{{ scope.row.onlineRate ? '%' : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="dataRate"
              label="数据合格率"
              show-overflow-tooltip
            />
            <el-table-column
              prop="orbitRate"
              label="轨迹完整率"
              show-overflow-tooltip
            />
            <el-table-column
              prop="shiftRate"
              label="高频漂移车辆率"
              show-overflow-tooltip
            />
            <el-table-column prop="failCount" label="不达标车辆数" />
            <el-table-column
              prop="action"
              label="操作"
              width="100"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  style="color: #2196F3"
                  @click="handleDetail(scope.row)"
                >
                  详情
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  style="color: #2196F3"
                  :disabled="isCommit(scope.row)"
                  @click="handleReported(scope.row)"
                >
                  上报
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          ref="pagination"
          :page-sizes="[30, 50, 100]"
          :page-size="pageSize"
          :current-page="pageNo"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        ></el-pagination>
      </div>
      <DetailTable
        ref="detailTable"
        :detail-visible="detailVisible"
        :table-height="tableHeight"
        :table-width="tableWidth"
        :row-data="rowData"
        @on-close="handleClose"
      />
      <ReportResult
        ref="reportTable"
        :report-visible="reportVisible"
        :table-height="tableHeight"
        :table-width="tableWidth"
        :row-data="reportRowData"
        @on-close="handleClose"
      />
    </h-layout>
  </h-page-container>
</template>
<script>
import { toTimezoneString, toTimeNormalString } from '@/components/util'
import DetailTable from './components/DetailTable'
import axios from 'axios'
import { getToken } from '@/utils/common'
import ReportResult from './components/ReportResult'
const now = new Date()
const nextMonth = new Date(now.getFullYear(), now.getMonth(), 1)
export default {
  name: 'PlatformAssess',
  components: { ReportResult, DetailTable },
  data () {
    return {
      // 查询参数
      queryParams: {
        calculateTotal: false,
        assessBatch: nextMonth.getTime() - 1,
        datePickerOptions: {
          disabledDate (time) {
            return time.getTime() >= nextMonth.getTime()
          }
        }
      },
      detailVisible: false,
      reportVisible: false,
      tableHeight: null,
      tableWidth: null,
      selectionRow: [],
      tableData: [],
      loading: false,
      rowData: {},
      reportRowData: {},
      pageSize: 30,
      pageNo: 1,
      total: 0
    }
  },
  created () {
    this.handleQuery()
  },
  mounted () {
    this.resize()
    window.addEventListener('resize', this.resize)
  },
  destroyed () {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    isCommit (row) {
      return row.isCommit === 1
    },
    handleDetail (row) {
      this.rowData = row
      this.detailVisible = true
    },
    handleReported (row) {
      this.reportRowData = row
      this.reportVisible = true
    },
    handleClose () {
      this.detailVisible = false
      this.reportVisible = false
    },
    //  时间转换
    getDateTime (time) {
      if (time === null) {
        return ''
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time))
        : ''
    },
    //  表格查询
    handleQuery () {
      this.loading = true
      const {
        pageNo,
        pageSize,
        queryParams: { assessBatch }
      } = this
      // if (assessBatch === '') {
      //   this.loading = false;
      //   this.$message.warning('请先选择月份！');
      //   return false;
      // }
      const dateStr = toTimeNormalString(toTimezoneString(assessBatch))
      const dateTemp = dateStr.split('-')[0] + dateStr.split('-')[1]
      const params = {
        pageNo,
        pageSize,
        assessBatch: dateTemp === 'undefined' ? undefined : dateTemp
      }
      axios
        .post('/alarmupload-web/feedback/pageAssessResult.do', params, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        })
        .then(res => {
          const data = res.data
          if (data.code === '0') {
            this.total = data.data.total
            this.tableData = [...data.data.list]
            this.loading = false
          } else {
            this.loading = false
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    //  表格查询条件重置
    handleReset () {
      this.queryParams = {
        calculateTotal: false,
        assessBatch: nextMonth.getTime() - 1
      }
    },
    resize () {
      this.tableHeight = this.$refs.pageBox.clientHeight
      this.tableWidth = this.$refs.pageBox.clientWidth
    },
    onCurrentChange (pageNo) {
      this.pageNo = pageNo
      this.handleQuery()
    },
    onSizeChange (pageSize) {
      this.pageSize = pageSize
      this.handleQuery()
    },
    //  重置表格
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    handleSelectionChange (selection) {
      this.selectionRow = selection
    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
  padding: 0 16px;
  width: 100%;
  .page-header {
    height: 50px;
    line-height: 50px;
  }
  .page-search {
    padding: 0 6px;
    height: 88px;
    position: relative;
    background-color: rgba(0, 0, 0, 0.04);
    .search-item {
      margin-top: 5px;
    }
    .search-btn {
      /*position: absolute;*/
      line-height: 88px;
      /*right: 6px;*/
    }
  }
}
.table-wrap {
  display: flex;
  /*min-height: 640px;*/
}
.el-table {
  /*min-height: 640px;*/
}
::v-deep {
  .el-form-item {
    margin-bottom: 16px;
  }
}
</style>
