<template>
    <h-page-container>
        <h-layout>
            <div ref="pageBox" class="page-box">
                <div id="pageSearch" class="page-search">
                    <el-row :gutter="16">
                        <el-col :span="5">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">报警类型</div>
                                <el-select
                                    v-model="queryParams.eventTypes"
                                    filterable
                                    multiple
                                    clearable
                                    collapse-tags
                                    placeholder="请选择报警类型"
                                >
                                  <el-option
                                    v-for="item in alarmTypes"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                  />
<!--                                    <el-option-->
<!--                                        v-for="(item, key) in ALARM_TYPE"-->
<!--                                        :key="key"-->
<!--                                        :label="item.name"-->
<!--                                        :value="item.eventType"-->
<!--                                    />-->
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="2">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">处置状态</div>
                                <el-select placeholder="请选择状态" v-model="queryParams.handle" clear>
                                    <el-option
                                        v-for="(item, key) in HANDLE_TYPE"
                                        :key="key"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="6">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">时间范围</div>
                                <el-date-picker
                                    v-model="queryParams.dateRange"
                                    type="datetimerange"
                                    :default-time="['00:00:00', '23:59:59']"
                                    value-format="timestamp"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    :picker-options="queryParams.datePickerOptions"
                                />
                            </div>
                        </el-col>

                        <el-col :span="3">
                            <div class="search-btn">
                                <el-button type="primary" @click="handleQuery">查询</el-button>
                                <el-button type="default" @click="handleReset">重置</el-button>
<!--                                <el-button type="default" @click="handleDo">处置</el-button>-->
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
                        :height="tableHeight - 166"
                        enable-virtual-scroll
                        force-scroll
                    >
                        <!--  @current-change="handleCurrentChange"  -->
<!--                        <el-table-column type="selection" :selectable="selectable"/>-->
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                            width="100"
                        />
                        <el-table-column prop="beginTime" label="开始时间" width="152">
                            <template slot-scope="scope">
                                {{ getDateTime(scope.row.beginTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="endTime" label="结束时间" width="152">
                            <template slot-scope="scope">
                                {{ getDateTime(scope.row.endTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="continueTime"
                            label="持续时间"
                            width="80"
                            show-overflow-tooltip
                        >
                            <template slot-scope="scope">
                                {{ scope.row.continueTime | formatSeconds }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="eventTypeName"
                            label="报警名称"
                            width="150"
                            show-overflow-tooltip
                        />
                        <el-table-column prop="level" label="报警级别" width="80">
                            <template slot-scope="scope">
                                <s-table-type
                                    :text="scope.row.level"
                                    :list="ALARM_LEVEL"
                                    type="iconSpan"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column prop="speed" label="定位速度" width="100">
                            <template slot-scope="scope">
                                {{ scope.row.beginSpeed/100000 + ' km/h' }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="value3" label="限速" width="100">
                            <template slot-scope="scope">
                                {{
                                    (scope.row.limitSpeed ? scope.row.limitSpeed : 0) + ' km/h'
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="orgName"
                            label="所属机构"
                            width="150"
                            show-overflow-tooltip
                        />
                      <el-table-column prop="userId" label="处置用户" width="80"/>
                      <el-table-column prop="handleTime" label="处置时间" width="152">
                        <template slot-scope="scope">
                          {{ getDateTime(scope.row.handleTime) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="handleDesc" label="报警处置描述" width="200"/>
                      <el-table-column prop="url" label="附件" width="80">
                        <template slot-scope="scope">
                          <el-button
                            v-if="scope.row.alarmHandleAttachment"
                            type="text"
                            size="mini"
                            style="color: #2196F3"
                            @click="handleDownload(scope.$index, scope.row)"
                          >
                            下载
                          </el-button>
                          <span v-else></span>
                        </template>
                      </el-table-column>
                        <el-table-column
                            prop="action"
                            label="操作"
                            width="80"
                            fixed="right"
                        >
                            <template slot-scope="scope">
                                <el-button
                                    type="text"
                                    size="mini"
                                    style="color: #2196F3"
                                    :disabled="getHandleCheck(scope.row)"
                                    @click="handleCheck(scope.row)"
                                >
                                    处置
                                </el-button>
<!--                                <el-button-->
<!--                                    v-else-->
<!--                                    type="text"-->
<!--                                    size="mini"-->
<!--                                    :disabled="getApproveType(2, scope.row)"-->
<!--                                    style="color: #2196F3"-->
<!--                                    @click="handleCheck(scope.$index, scope.row)"-->
<!--                                >-->
<!--                                    复核-->
<!--                                </el-button>-->
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
        </h-layout>
      <BroadcastDialog :tempRow="tempRow" @on-close="handleClose"
        ref="BroadcastDialog"
      ></BroadcastDialog>
    </h-page-container>
</template>

<script>
import { HANDLE_TYPE, ALARM_TYPE, ALARM_LEVEL } from './config.js'
import axios from 'axios'
import STableType from '@/components/STableType'
import { toTimeNormalString, toTimezoneString } from '@/components/util'
import BroadcastDialog from '@/pages/alarmHandle/components/BroadcastDialog'
import { getToken } from '@/utils/common'
import alarmUtil from '@/utils/alarm'

const now = new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000)
now.setHours(0)
now.setMinutes(0)
now.setSeconds(0)
now.setMilliseconds(0)
const endTime = now.getTime() + 6 * 24 * 60 * 60 * 1000 - 1
export default {
  name: 'AlarmHandle',
  // 注册组件
  components: {
    BroadcastDialog,
    STableType
  },
  data () {
    return {
      HANDLE_TYPE,
      ALARM_TYPE,
      ALARM_LEVEL,
      tempRow: {},
      loading: false,
      tableData: [],
      tableHeight: null,
      tableWidth: null,
      sliderShow: false,
      sliderInfo: {},
      alarmTypes: [],
      // 查询参数
      queryParams: {
        eventTypes: '', // 报警类型
        handle: '', // 处置状态
        dateRange: [now, endTime],
        // type: '',
        datePickerOptions: {
          disabledDate (time) {
            return time.getTime() > endTime
          },
          customValidation (end, start) {
            console.log((end.getTime() - start.getTime()) <= 31 * 24 * 60 * 60 * 1000)
            console.log(start.getTime())
            console.log(end.getTime())

            return (end.getTime() - start.getTime()) <= 31 * 24 * 60 * 60 * 1000
          },
          customPrompt: '选择时间范围不能超过31天'
        }
      },
      pageSize: 30,
      pageNo: 1,
      total: 0
    }
  },
  created () {
    this.getAllAlarmTypes()
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
    getHandleCheck (row) {
      // return (new Date().getTime() - row.beginTime) > 7 * 24 * 60 * 60 * 1000
    },
    handleClose () {
      this.handleQuery()
    },
    // 查询列表
    handleQuery () {
      this.loading = true
      const {
        queryParams: {
          eventTypes, // 报警类型
          handle, // 处置状态
          dateRange
        },
        pageNo,
        pageSize
      } = this
      const eventTypesTemp = eventTypes.length === 0 ? undefined : eventTypes
      const params = {
        pageNo,
        pageSize,
        handle,
        eventTypes: eventTypesTemp
      }
      if (dateRange) {
        params.beginTime = toTimezoneString(dateRange[0])
        params.endTime = toTimezoneString(dateRange[1])
      }
      // this.alarmParams = params
      axios
        .post('/alarmupload-web/feedback/findAlarmPage.do', params, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        })
        .then(res => {
          this.loading = false
          // console.log('list', res.data.data)
          this.tableData = res.data.data.list
          this.total = res.data.data.total
        })
      this.loading = false
    },
    // 重置查询条件
    handleReset () {
      this.queryParams.eventTypes = []
      this.queryParams.validType = null
      this.queryParams.dateRange = [now, endTime]
    },
    // 处置跳转
    handleCheck (row) {
      this.tempRow = row
      this.$refs.BroadcastDialog.openDialog()
    },
    getLabelValueByKey (alarm, key) {
      return alarmUtil.getLabelValueByKey(alarm, key)
    },
    getDateTime (time) {
      if (time === null) {
        return ''
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time))
        : ''
    },
    //  解析地理位置
    handleDownload (index, row) {
      console.log(row)
      if (row.alarmHandleAttachment !== '' || row.alarmHandleAttachment !== null) {
        // 执行下载
        window.location.href = row.alarmHandleAttachment
      } else {
        this.$message({
          message: '无相关附件',
          type: 'warning'
        })
      }
    },
    getAllAlarmTypes () {
      axios
        .get('/alarmupload-web/feedback/getAlarmTypes.do', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        })
        .then(res => {
          console.log(res.data)
          this.alarmTypes = res.data.data.map(item => {
            return {
              label: item.name,
              value: item.eventType,
              key: item.eventType
            }
          })
        })
    },
    onCurrentChange (pageNo) {
      this.pageNo = pageNo
      this.handleQuery()
    },
    onSizeChange (pageSize) {
      this.pageSize = pageSize
      this.handleQuery()
    },
    resize () {
      this.tableHeight = this.$refs.pageBox.clientHeight
      this.tableWidth = this.$refs.pageBox.clientWidth
    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
    padding: 0 16px;
    width: 100%;
    .page-search {
        padding: 10px  6px 0 6px;
        height: 88px;
        position: relative;
        //background-color: rgba(0, 0, 0, 0.04);

        .search-item {
            margin-top: 5px;
        }

        .search-btn {
            position: absolute;
            line-height: 88px;
            //right: 6px;
        }
    }

    .page-alarm-level {
        display: flex;
        flex-direction: row-reverse;
        height: 18px;
        margin: 10px 0;
    }
}

.info-slider {
    transition: all 0.5s;
}

.info-slider-close {
    width: 0;
    opacity: 0;
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
