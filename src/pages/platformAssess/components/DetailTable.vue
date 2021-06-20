<template>
  <el-dialog
    title="考核数据详情"
    top="10%"
    :visible.sync="detailVisible"
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
          <el-col :span="4">
            <el-select v-model="queryParams.isFail" placeholder="是否达标" clear>
              <el-option
                v-for="(item, key) in failList"
                :key="key"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <div class="search-btn">
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button type="default" @click="handleReset">重置</el-button>
              <el-button icon="h-icon-access" @click="handleCheckBatch">
                批量处理
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-table
        ref="detailTableRef"
        v-loading="loading"
        :data="tableData"
        :height="tableHeight * 0.6"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" :selectable="selectable" />
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
          prop="onlineTime"
          label="在线时长"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="dataRate"
          label="数据合格率"
          show-overflow-tooltip
        />
        <el-table-column prop="orbitRate" label="轨迹完整率" />
        <el-table-column prop="shiftTimes" label="漂移次数" />
        <el-table-column prop="isFail" label="是否达标">
          <template slot-scope="scope">
            <span>{{ scope.row.isFail === 1 ? '已达标' : '未达标' }}</span>
          </template>
        </el-table-column>
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
              :disabled="scope.row.isFail === 1"
              @click="handleData(scope.row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
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
      <el-dialog
        title="处理"
        :visible.sync="dialogVisible"
        size="small"
        :before-close="handleFormClose"
        :area="dialogWidth * 0.4"
      >
        <el-form
          ref="dataForm"
          style="padding: 0 24px"
          label-position="top"
          :model="dataForm"
          :validate-on-rule-change="false"
          :rules="dataFormRules"
          label-width="90px"
          content-width="400px"
        >
          <el-form-item label="整改情况" prop="isHandle">
            <el-radio-group v-model="dataForm.isHandle" @change="handleChange">
              <el-radio :label="0">未整改</el-radio>
              <el-radio :label="1">已整改</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="完成整改日期" prop="handleDate">
            <el-date-picker
              v-model="dataForm.handleDate"
              :disabled="isHandle"
              type="date"
              placeholder="选择日期"
              style="width: 100%;"
              :picker-options="datePickerOptions"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="整改措施描述" prop="handleDesc">
            <el-input
              v-model="dataForm.handleDesc"
              :disabled="isHandle"
              type="textarea"
              tips-placement="right"
            ></el-input>
          </el-form-item>
          <el-form-item label="不达标原因" prop="failReason">
            <el-input
              v-model="dataForm.failReason"
              type="textarea"
              tips-placement="right"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleOk">
            确 定
          </el-button>
          <el-button @click="handleFormClose">取 消</el-button>
        </span>
      </el-dialog>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios';
import { getToken, findIndexObject } from '@/utils/common';
import { toTimeNormalString, toTimezoneString } from '@/components/util';
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
export default {
  name: 'DetailTable',
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
    detailVisible: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },
  data() {
    return {
      failList: [
        { value: 0, label: '未达标' },
        { value: 1, label: '已达标' }
      ],
      queryParams: {
        isFail: ''
      },
      dataForm: {
        isHandle: 0
      },
      dataFormRules: {
        failReason: [
          { required: true, message: '请输入未达标原因' }
        ]
      },
      isHandle: true,
      selectionRow: [],
      isBatch: false,
      dialogWidth: 0,
      dialogHeight: 0,
      dialogVisible: false,
      pageSize: 30,
      pageNo: 1,
      total: 0,
      date: '',
      loading: false,
      tableData: [],
      handleRowData: {},
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
    detailVisible(val) {
      this.$nextTick(() => {
        if (val) {
          this.handleQuery();
        }
      })
    }
  },
  methods: {
    //  解析车牌颜色
    getPlateColor(val) {
      return val ? findIndexObject(this.plateColorList, ['value', val]).label : '';
    },
    //  查询数据
    handleQuery() {
      this.loading = true;
      const { pageNo, pageSize, date, queryParams: { vehicleNo, isFail } } = this;
      const params = { pageNo, pageSize, assessBatch: date, vehicleNo, isFail: isFail === '' ? undefined : isFail };
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
    handleFormClose() {
      this.resetForm('dataForm');
      this.dialogVisible = false;
    },
    //  处理 确认
    handleOk() {
      this.$refs.dataForm.validate((valid, invalidFields) => {
        if (valid) {
          const { dataForm, handleRowData, rowDataTemp } = this;
          const dateTemp = toTimeNormalString(toTimezoneString(dataForm.handleDate));
          let params = [];
          if (this.isBatch) {
            this.selectionRow.forEach(item => {
              const obj = {
                detailId: item.detailId,
                failReason: dataForm.failReason,
                handleAttachment: item.handleAttachment,
                handleDate: dateTemp.split(' ')[0],
                handleDesc: dataForm.handleDesc,
                isHandle: dataForm.isHandle
              };
              params.push(obj);
            });
          } else {
            params = [
              {
                detailId: handleRowData.detailId,
                failReason: dataForm.failReason,
                handleAttachment: handleRowData.handleAttachment,
                handleDate: dateTemp.split(' ')[0],
                handleDesc: dataForm.handleDesc,
                isHandle: dataForm.isHandle
              }
            ];
          }
          this.resetForm('dataForm');
          axios
            .post(
              '/alarmupload-web/feedback/saveAssessResultHandleDetail.do',
              params,
              {
                headers: {
                  'X-Requested-With': 'XMLHttpRequest',
                  'X-CSRF-TOKEN': getToken()
                }
              }
            )
            .then(res => {
              const data = res.data;
              if (data.code === '0') {
                this.dialogVisible = false;
                this.handleQuery();
              } else {
                this.dialogVisible = false;
              }
            })
            .catch(() => {
              this.dialogVisible = false;
            });
        } else {
          return false;
        }
      });
    },
    handleReset() {
      this.queryParams = { isFail: '' };
    },
    handleCheckBatch() {
      if (this.selectionRow.length > 0) {
        this.isBatch = true;
        this.dialogVisible = true;
      } else {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择要处理的考核结果'
        });
      }
    },
    handleSelectionChange(selection) {
      this.selectionRow = selection;
    },
    handleChange(e) {
      this.isHandle = e === 0;
      if (e === 0) {
        this.dataFormRules = {
          failReason: [
            { required: true, message: '请输入未达标原因' }
          ]
        };
      } else {
        this.dataFormRules = {
          handleDate: [
            { required: true, message: '请选择整改日期' }
          ],
          handleDesc: [
            { required: true, message: '请输入整改措施描述' }
          ],
          failReason: [
            { required: true, message: '请输入未达标原因' }
          ]
        };
      }
      this.resetValidates('dataForm');
    },
    handleData(row) {
      this.handleRowData = row;
      this.dialogVisible = true;
      this.isBatch = false;
    },
    handleClose() {
      this.queryParams = { isFail: '' };
      this.$emit('on-close');
    },
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
      this.handleQuery();
    },
    onSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.handleQuery();
    },
    selectable(row, index) {
      return row.isFail === 0;
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    //  重置表格验证规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-header {
  margin-bottom: 8px;
}
</style>
