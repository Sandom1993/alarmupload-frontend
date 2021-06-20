<template>
  <el-dialog
    title="考核结果处理情况"
    top="10%"
    :visible.sync="reportVisible"
    :area="dialogWidth"
    :before-close="handleClose"
  >
    <div>
      <div class="dialog-header">
        <el-row :gutter="16">
          <el-col :span="4">
            <div class="search-item">
              <el-input v-model="queryParams.vehicleNo" placeholder="车牌号码" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="search-btn">
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button type="default" @click="handleReset">重置</el-button>
              <el-button icon="h-icon-access" @click="handleAssess">
                上报
              </el-button>
            </div>
          </el-col>
        </el-row>
        <div style="margin-top: 6px; color: #333333; font-size: 14px">
          已处理：<span style="color: #2080f7">{{ handleResult }}</span>条
        </div>
      </div>
      <el-table
        ref="detailTableRef"
        v-loading="loading"
        :data="tableData"
        :height="tableHeight * 0.6"
        stripe
      >
        <el-table-column prop="vehicleNo" label="车牌号码" />
        <el-table-column prop="plateColorCode" label="车牌颜色">
          <template slot-scope="scope">
            {{ getPlateColor(scope.row.plateColorCode) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="ownerName"
          label="所属运营商平台"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="isHandle"
          label="整改情况"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ getIsHandle(scope.row.isHandle) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="handleDesc"
          label="整改措施"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="isHandle"
          label="处理情况"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ getHandle(scope.row.isHandle) }}
          </template>
        </el-table-column>
        <el-table-column prop="isFail" label="是否达标">
          <template slot-scope="scope">
            <span>{{ scope.row.isFail === 1 ? '已达标' : '未达标' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="failReason"
          label="未达标原因"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
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
  </el-dialog>
</template>

<script>
import axios from 'axios';
import { getToken, findIndexObject } from '@/utils/common';
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
export default {
  name: 'ReportResult',
  components: {},
  props: {
    tableHeight: {
      type: Number,
      default: function() {
        return 0;
      }
    },
    tableWidth: {
      type: Number,
      default: function() {
        return 0;
      }
    },
    rowData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    reportVisible: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },
  data() {
    return {
      queryParams: {},
      dataForm: {
        isHandle: 0
      },
      isHandle: true,
      dialogWidth: 0,
      dialogHeight: 0,
      pageSize: 30,
      pageNo: 1,
      total: 0,
      date: '',
      loading: false,
      tableData: [],
      handleRowData: {},
      handleResult: 0,
      rowDataTemp: {},
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > endTime;
        }
      },
      plateColorList: [
        { value: '1', label: '蓝色' },
        { value: '2', label: '黄色' },
        { value: '3', label: '黑色' },
        { value: '4', label: '白色' },
        { value: '5', label: '绿色' },
        { value: '9', label: '其他' },
        { value: '91', label: '农黄色' },
        { value: '92', label: '农绿色' },
        { value: '93', label: '黄绿色' },
        { value: '94', label: '渐变绿' }
      ]
    };
  },
  watch: {
    tableHeight(val) {
      this.dialogHeight = val * 0.8;
    },
    tableWidth(val) {
      this.dialogWidth = val * 0.75;
    },
    rowData: {
      handler(e) {
        this.rowDataTemp = e;
        this.date = e.assessBatch;
      },
      deep: true
    },
    reportVisible(val) {
      this.$nextTick(() => {
        if (val) {
          this.handleQuery();
          this.getHandleResult();
        }
      })
    }
  },
  methods: {
    //  解析处理情况
    getHandle(val) {
      return val === null ? '未处理' : '已处理';
    },
    //  解析整改情况
    getIsHandle(val) {
      return val === 1 ? '已整改' : '未整改';
    },
    //  解析车牌颜色
    getPlateColor(val) {
      return val ? findIndexObject(this.plateColorList, ['value', val]).label : '';
    },
    //  获取处理结果
    getHandleResult() {
      const { date } = this;
      axios
        .get('/alarmupload-web/feedback/getHandleCount.do', {
          params: { assessBatch: date },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        }
        )
        .then(res => {
          const data = res.data;
          if (data.code === '0') {
            this.handleResult = data.data;
          }
        })
        .catch(() => {});
    },
    //  查询数据
    handleQuery() {
      this.loading = true;
      const { pageNo, pageSize, date, queryParams: { vehicleNo } } = this;
      const params = { pageNo, pageSize, assessBatch: date, vehicleNo, isFail: 0 };
      axios
        .post('/alarmupload-web/feedback/pageAssessResultDetail.do', params, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        })
        .then(res => {
          const data = res.data;
          if (data.code === '0') {
            this.total = data.data.total;
            this.tableData = [...data.data.list];
            this.loading = false;
          } else {
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    //  搜索条件重置
    handleReset() {
      this.queryParams = {}
    },
    //  上报考核结果
    handleAssess() {
      this.$confirm('考核结果每月只能上报一次，是否继续？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const { date } = this;
        axios
          .get('/alarmupload-web/feedback/uploadAssessResultHandle.do', {
            params: { assessBatch: date },
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRF-TOKEN': getToken()
            }
          })
          .then(res => {
            const data = res.data;
            if (data.code === '0') {
              this.$message.success('数据上报成功！');
            }
          })
          .catch(() => {
            this.$message.error('数据上报失败！');
          });
      }).catch(() => {})
    },
    handleClose() {
      this.$emit('on-close');
    },
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
      this.handleQuery();
    },
    onSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.handleQuery();
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-header {
  margin-bottom: 8px;
}
</style>
