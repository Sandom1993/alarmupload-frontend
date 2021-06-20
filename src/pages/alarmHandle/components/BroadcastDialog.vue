<template>
  <el-dialog
    v-loading="loading"
    :area="408"
    :title="title"
    :visible.sync="dialogVisible"
    :modal="false"
    size="small"
  >
    <div class="dialog-content">
      <div class="message">
        <div class="message-head">
          处置内容：
        </div>
        <div class="message-wrap">
          <div class="to-send">
            <el-input
              v-model="textarea"
              placeholder="请输入关键字"
              :autosize="{ minRows: 5, maxRows: 5 }"
              type="textarea"
              style="height:104px;"
            ></el-input>
          </div>
          <div class="template-word">
            <div class="template-word-head">
              <span>短信模板</span>
              <span style="float:right;">
                <el-button
                  type="iconButton"
                  icon="h-icon-add"
                  @click="addEvent"
                ></el-button>
                <el-button
                  type="iconButton"
                  icon="h-icon-edit"
                  :disabled="isEditOff"
                  @click="editEvent"
                ></el-button>
                <el-button
                  type="iconButton"
                  icon="h-icon-delete"
                  :disabled="isDeleteOff"
                  @click="deleteTemp"
                ></el-button>
              </span>
            </div>
            <el-scrollbar
              wrap-style="max-height:160px;"
              view-style="padding:8px;margin: 0px;"
              view-class="el-scrollbar_view"
              tag="ul"
            >
              <li v-for="item in txtTemplate" :key="item.id">
                <el-radio v-model="checkedTemp" :label="item.id">
                  {{ item.value }}
                </el-radio>
              </li>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <div class="message-head">下发方式：</div>
      <div class="sent-type">
        <el-checkbox v-model="TTSChecked">
          终端TTS播读
        </el-checkbox>
        <el-checkbox v-model="inCarChecked">
          终端显示器显示
        </el-checkbox>
      </div>
      <div v-if="isNeedBroadcastingType" class="broadcast-type">
        <el-form
          ref="form2"
          :model="form2"
          :rules="rules2"
          label-width="80px"
          message-position="bottom"
          label-position="left"
        >
          <el-form-item label="播报类型" prop="type">
            <el-radio v-model="form2.type" class="radio" :label="0">
              实时播报
            </el-radio>
            <el-radio v-model="form2.type" class="radio" :label="1">
              定时播报
            </el-radio>
            <el-radio v-model="form2.type" class="radio" :label="2">
              上线播报
            </el-radio>
          </el-form-item>
          <el-form-item
            v-show="form2.type === 1"
            label="播报频率"
            prop="frequency"
          >
            <el-input-number
              v-model="form2.frequency"
              style="margin-right:8px"
              :min="5"
              :max="1440"
              :reset-default="true"
            ></el-input-number>
            分钟/次
          </el-form-item>
          <el-form-item
            v-show="form2.type === 1"
            label="截止时间"
            prop="endTime"
          >
            <el-date-picker
              v-model="form2.endTime"
              type="datetime"
              :picker-options="pickerOptions"
              placeholder="请选择截止时间"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-dialog
      :area="[320, 200]"
      :title="isAdd ? '添加模板' : '编辑模板'"
      :visible.sync="innerVisible"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="formRules" label-width="0px">
        <el-form-item prop="updateTextarea">
          <el-input
            v-model="form.updateTextarea"
            class="el-input--height"
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="isAdd" type="primary" @click="addTemp()">
          添加
        </el-button>
        <el-button v-else type="primary" @click="editTemp()">
          确定
        </el-button>
        <el-button @click="innerVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>
    <div class="btn-wrap">
      <el-button type="primary" @click="sendMessage">
        发送
      </el-button>
      <el-button @click="dialogVisible = false">
        取消
      </el-button>
    </div>
    <div class="message-head">
      选择的{{ tableData.length }}辆车
      <el-button
        v-if="showReSend"
        icon="h-icon-refresh_sm"
        title="对下发失败的车辆重新发送"
        @click="reSend"
      />
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="160px"
      class="broadcast-table"
    >
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column
        prop="plateNo"
        label="车牌"
        width="150"
      ></el-table-column>
      <el-table-column label="下发结果" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.sendCode === '0'" class="send-success">
            {{ scope.row.msg }}
          </span>
          <span
            v-else-if="scope.row.sendCode !== undefined"
            class="send-failure"
            :title="scope.row.msg"
          >
            {{ scope.row.msg }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>

// import { toTimezoneString, toTimeNormalString } from '@/components/util.js'
import { toTimezoneString } from '@/components/util.js'
import { ALLBY_TYPE } from '../config'

export default {
  name: 'BroadcastDialog',
  props: {
    title: {
      type: String,
      default: '处置内容'
    },
    vehicleIndexCodes: {
      type: Array,
      default: () => []
    },
    vehicles: {
      type: Array,
      default: () => []
    },
    buttonLoading: {
      type: Boolean,
      default: false
    },
    isNeedBroadcastingType: {
      type: Boolean,
      default: false
    },
    alarms: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      ALLBY_TYPE,
      loading: false,
      countNum: 0,
      veList: [],
      paramsVeArr: [],
      errorArr: [],
      successArr: [],
      dialogVisible: false, // 是否显示 该组件dialog
      innerVisible: false, // 是否显示 内部添加模板dialog
      emergencyChecked: false,
      TTSChecked: false, // 终端TTS播读 是否勾选
      inCarChecked: false, // 终端显示器显示 是否勾选
      outCarSelected: false,
      textarea: '', // 下发消息内容
      txtTemplate: [], // 短信模板
      form: {
        updateTextarea: ''
      },
      form2: {
        type: 0,
        frequency: 5,
        endTime: new Date()
      },
      pickerOptions: {
        disabledDate (time) {
          return (
            !(time.getTime() > new Date().getTime() - 1000 * 3600 * 24) ||
            time.getTime() > new Date().getTime() + 1000 * 3600 * 24 * 7
          ) //
        }
      },
      formRules: {
        // updateTextarea: [{ validator: validate.specialWord, trigger: 'blur' }]
      },
      rules2: {},
      isAdd: true, // 添加模板还是修改模板
      isEditOff: true, // 是否禁止编辑  只有选中一个时可编辑  true 不可编辑  false 可编辑 而且和当前用户userId相同
      isDeleteOff: true, // 是否可删除 选中数量大于0 可删除
      selectedEvent: [], // 选择的模板
      checkedTemp: '', // 单选中的模板
      tableData: []
    }
  },
  computed: {
    showReSend () {
      return (
        this.tableData &&
        this.tableData.some(item => item.sendCode && item.sendCode !== '0')
      )
    }
  },
  watch: {
    countNum (val) {
      if (val === this.paramsVeArr.length) {
        const error = [...this.errorArr].length
        // eslint-disable-next-line no-unused-vars
        const veArr = [...this.errorArr].map(item => {
          return item.data
        })
        const success = [...this.successArr].length
        if (error === 0 && success > 0) {
          this.$message.success('下发成功')
          this.loading = false
        } else if (success === 0 && error > 0) {
          this.$message.error('所有车辆下发失败')
          this.loading = false
        } else {
          this.$message.error(`${error}个车辆下发失败`)
          this.loading = false
        }
      }
    },
    checkedTemp (n, o) {
      // 更改选中的模板
      // 如果有值，而且模板userId和当前userId一样，则可以删除和编辑
      const { userId } = this.$store.state.userInfo
      if (
        n &&
        (userId === 'admin' ||
          userId === this.txtTemplate.find(i => i.id === n).userId)
      ) {
        this.isEditOff = false
        this.isDeleteOff = false
      } else {
        this.isEditOff = true
        this.isDeleteOff = true
      }
      // 更新textarea的值
      let str = ''
      const item = this.txtTemplate.find(i => i.id === n)
      str = item.value
      if (this.textarea) {
        const prefix = this.textarea.match(/(\[车牌号\])*/)[0]
        this.textarea = prefix + str
      } else {
        this.textarea = str
      }
    }
  },
  methods: {
    openDialog () {
      this.dialogVisible = true
      this.getTemp();
    },
    // showEditBtn(id) {
    //   let str = '';
    //   this.txtTemplate.forEach(item => {
    //     const cItem = item;
    //     cItem.showEdit = false;
    //     if (id === item.id) {
    //       cItem.showEdit = true;
    //       str = item.value;
    //     }
    //   });
    //   const item = this.txtTemplate.find(i => i.id === this.checkedTemp);
    //   str = item.value;
    //   if (this.textarea) {
    //     const prefix = this.textarea.match(/(\[车牌号\])*/)[0];
    //     this.textarea = prefix + str;
    //   } else {
    //     this.textarea = str;
    //   }
    // },
    selectEvent () {
      const event = this.txtTemplate.filter(item => item.checked)
      this.selectedEvent = event
      this.isEditOff = event.length !== 1
      this.isDeleteOff = event.length === 0
    },
    // 获取模板文字
    getTemp () {
      // const list = json.data.concat()
      const list = ALLBY_TYPE
      const arr = []
      list.forEach(item => {
        arr.push({
          id: item.id,
          value: item.messageContent,
          checked: false,
          userId: item.userId
        })
      })
      this.txtTemplate = arr
      // this.selectEvent();
      this.checkedTemp = ''
    },
    addEvent () {
      this.isAdd = true
      this.form.updateTextarea = ''
      this.innerVisible = true
      this.$nextTick(() => {
        this.$refs.form.resetValidates()
      })
    },
    editEvent () {
      // const event = this.selectedEvent[0];
      const event = this.txtTemplate.find(i => i.id === this.checkedTemp)
      this.isAdd = false
      this.innerVisible = true
      this.form.updateTextarea = event.value
      this.$nextTick(() => {
        this.$refs.form.resetValidates()
      })
    },
    // 添加模板文字
    addTemp () {
      let flag = true
      this.$refs.form.validate(valid => {
        flag = flag && valid
      })
      if (!flag) {
        this.$message({
          type: 'warning',
          message: '表单中存在不合法的项'
        })
        return
      }
      if (this.form.updateTextarea.length > 512) {
        this.$message({
          type: 'warning',
          message: '字符长度不得超过512'
        })
      }
      // addTxTTemp({
      //   messageType: 0,
      //   messageContent: this.form.updateTextarea
      // }).then(json => {
      //   if (json.code === '0') {
      //     this.$message({
      //       type: 'success',
      //       message: '添加成功'
      //     })
      //     this.innerVisible = false
      //     this.getTemp()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: '添加模板出错'
      //     })
      //   }
      // })
    },
    // 编辑模板文字
    editTemp () {
      let flag = true
      this.$refs.form.validate(valid => {
        flag = flag && valid
      })
      if (!flag) {
        this.$message({
          type: 'warning',
          message: '表单中存在不合法的项'
        })
        return
      }
      if (this.form.updateTextarea.length > 512) {
        this.$message({
          type: 'warning',
          message: '字符长度不得超过512'
        })
      }
      // updateTxTTemp({
      //   id: this.checkedTemp,
      //   messageType: 0,
      //   messageContent: this.form.updateTextarea
      // }).then(json => {
      //   if (json.code === '0') {
      //     this.$message({
      //       type: 'success',
      //       message: '编辑成功'
      //     })
      //     this.innerVisible = false
      //     this.getTemp()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: '修改模板出错'
      //     })
      //   }
      // })
    },
    // 删除模板文字
    deleteTemp () {
      this.$confirm('删除模板?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        // deleteTxTTemp([this.checkedTemp]).then(json => {
        //   if (json.code === '0') {
        //     this.getTemp()
        //     this.$message({
        //       type: 'success',
        //       message: '删除成功'
        //     })
        //   }
        // })
      })
    },
    reSend (vehicle, $index) {
      const vehicles = this.tableData
        .filter(item => item.sendCode !== '0')
        .map(item => {
          return {
            plateNo: item.plateNo,
            vehicleIndexCode: item.vehicleIndexCode
          }
        })
      this.sendMessage({
        vehicles: vehicles
      })
    },
    // 下发消息
    sendMessage (resendParam) {
      if (!this.textarea) {
        this.$message({
          type: 'warning',
          message: '请输入信息'
        })
        return
      }

      if (this.textarea.length > 512) {
        this.$message({
          type: 'warning',
          message: '信息内容长度不能超过512个字符'
        })
        return
      }

      const ASCII_UN_USE = []
      // ASCII_UN_USE[0] = ['32'];// SPACE
      ASCII_UN_USE[1] = ['33'] // !
      ASCII_UN_USE[2] = ['34'] // "
      ASCII_UN_USE[3] = ['35'] // #
      ASCII_UN_USE[4] = ['36'] // $
      ASCII_UN_USE[5] = ['37'] // %
      // ASCII_UN_USE[6] = ['38'];// &
      ASCII_UN_USE[7] = ['39'] // '
      ASCII_UN_USE[8] = ['40'] // (
      ASCII_UN_USE[9] = ['41'] // )
      ASCII_UN_USE[10] = ['42'] // *
      ASCII_UN_USE[11] = ['43'] // +
      // ASCII_UN_USE[12] = ['44']; // ,
      ASCII_UN_USE[13] = ['45'] // -
      ASCII_UN_USE[14] = ['47'] // /
      // ASCII_UN_USE[15] = ['58']; // :
      // ASCII_UN_USE[16] = ['59']; // ;
      ASCII_UN_USE[17] = ['60'] // <
      ASCII_UN_USE[18] = ['61'] // =
      ASCII_UN_USE[19] = ['62'] // >
      ASCII_UN_USE[20] = ['63'] // ?
      ASCII_UN_USE[21] = ['64'] // @
      ASCII_UN_USE[22] = ['92'] // \
      ASCII_UN_USE[23] = ['94'] // ^
      ASCII_UN_USE[24] = ['95'] // _
      ASCII_UN_USE[25] = ['123'] // {
      ASCII_UN_USE[26] = ['124'] // |
      ASCII_UN_USE[27] = ['125'] // }
      ASCII_UN_USE[28] = ['126'] // ~

      const arr11 = []
      ASCII_UN_USE.forEach(item => {
        const s = String.fromCharCode(parseInt(item, 10))
        if (this.textarea.indexOf(s) > -1) {
          arr11.push(s)
        }
      })
      if (this.textarea.indexOf('“') > -1) {
        arr11.push('“')
      }
      if (this.textarea.indexOf('”') > -1) {
        arr11.push('”')
      }
      if (this.textarea.indexOf(' ') > -1) {
        arr11.push('空格')
      }
      if (arr11.length > 0) {
        this.$message({
          type: 'warning',
          message: `不能输入以下字符: ${arr11.join(' ')}`
        })
        return
      }
      // if (this.textarea.length > 18) {
      //   this.$message({
      //     type: 'warning',
      //     message: '字符长度不得超过18',
      //   });
      //   return;
      // }
      this.veList = resendParam.vehicles || this.vehicles
      this.successArr = []
      this.errorArr = []
      this.paramsVeArr = []
      this.loading = true
      for (let i = 0; i < this.veList.length; i += 20) {
        this.paramsVeArr.push(this.veList.slice(i, i + 20))
      }
      this.paramsVeArr.forEach(item => {
        // eslint-disable-next-line no-unused-vars
        const param = {
          // vehicleIndexCodes: this.vehicleIndexCodes,
          // vehicles: resendParam.vehicles || this.vehicles,
          vehicles: item,
          message: this.textarea,
          onEmergent: this.emergencyChecked,
          onTerminal: this.inCarChecked,
          onTTS: this.TTSChecked,
          onLED: this.outCarSelected,
          needConfirm: 0,
          userId: '',
          broadcastType: this.form2.type,
          broadcastRate: this.form2.frequency,
          endTime: toTimezoneString(this.form2.endTime),
          type: 1 // 0：点名，1：下发消息
        }
        this.$emit('update:buttonLoading', true)
        if (resendParam.index) {
          this.$set(this.tableData[resendParam.index], 'loading', true)
        }
        // this.dialogVisible = false;
        this.countNum = 0
        // batchBroadcast(param)
        //   .then(json => {
        //     if (json.code === '0') {
        //       this.countNum++
        //       if (json.data) {
        //         if (json.data.filter(item => item.code === '0').length > 0) {
        //           json.data
        //             .filter(item => item.code === '0')
        //             .forEach(item => {
        //               this.successArr.push(item)
        //             })
        //         }
        //         if (json.data.filter(item => item.code !== '0').length > 0) {
        //           json.data
        //             .filter(item => item.code !== '0')
        //             .forEach(item => {
        //               this.errorArr.push(item)
        //             })
        //         }
        //         json.data.forEach(item => {
        //           const index = this.tableData.findIndex(
        //             vehicle => vehicle.plateNo === item.data
        //           )
        //           if (index > -1) {
        //             this.$set(this.tableData[index], 'sendCode', item.code)
        //             this.$set(
        //               this.tableData[index],
        //               'msg',
        //               item.msg || (item.code === '0' ? '下发成功' : '下发失败')
        //             )
        //           }
        //         })
        //         // 下发消息成功以后，调用保存标签的接口，保存下发消息的标签，风险事件暂不处理
        //         // 下发消息成功的车辆对应的报警就保存标签
        //         if (
        //           this.alarms &&
        //           this.alarms.length > 0 &&
        //           !this.alarms[0].isRiskEvent
        //         ) {
        //           const labels = []
        //           const messageLabels = [
        //             {
        //               key: 'broadcast',
        //               value: '2' // 1:系统自动处警 2:人工处警
        //             },
        //             {
        //               key: 'message',
        //               value: param.message
        //             }
        //           ]
        //           this.successArr.forEach(successVehicle => {
        //             this.alarms.forEach(alarm => {
        //               if (alarm.vehicleLicensePlate === successVehicle.data) {
        //                 labels.push({
        //                   component: process.env.VUE_APP_COMPONENT_ID,
        //                   beginTime: toTimezoneString(alarm.beginTime),
        //                   eventId: alarm.eventId,
        //                   labels: messageLabels
        //                 })
        //               }
        //             })
        //           })
        //           if (labels.length > 0) {
        //             batchSaveAlarmLabel(labels).then(json => {
        //               if (json.code === '0') {
        //                 messageLabels.push({
        //                   key: 'dealPerson',
        //                   value: this.$store.state.userInfo.userId
        //                 })
        //                 messageLabels.push({
        //                   key: 'dealTime',
        //                   value: toTimeNormalString(
        //                     toTimezoneString(new Date().getTime())
        //                   )
        //                 })
        //                 this.$emit('saveMessageLabelSuccess', {
        //                   eventIds: labels.map(item => item.eventId),
        //                   label: {
        //                     component: process.env.VUE_APP_COMPONENT_ID,
        //                     labels: messageLabels
        //                   }
        //                 })
        //               }
        //             })
        //           }
        //         }
        //       } else {
        //         this.$message.success('下发成功')
        //         setTimeout(() => {
        //           this.dialogVisible = false
        //         }, 3000)
        //         this.tableData.forEach((item, index) => {
        //           this.$set(this.tableData[index], 'sendCode', '0')
        //           this.$set(this.tableData[index], 'msg', '下发成功')
        //         })
        //       }
        //       this.$emit('sendMessage')
        //     } else {
        //       this.$message.error('下发失败')
        //       this.tableData.forEach((item, index) => {
        //         this.$set(this.tableData[index], 'sendCode', '-1')
        //         this.$set(this.tableData[index], 'msg', '下发失败')
        //       })
        //     }
        //   })
        //   .catch(e => {
        //     this.tableData.forEach((item, index) => {
        //       this.$set(this.tableData[index], 'sendCode', '-1')
        //       this.$set(this.tableData[index], 'msg', '下发失败')
        //     })
        //   })
        //   .finally(() => {
        //     this.$emit('update:buttonLoading', false)
        //   })
      })
    },
    insertPlateNo () {
      this.textarea = '[车牌号]' + this.textarea
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog-content {
  padding: 0px;
  font-family: 'MicrosoftYaHei';
  font-size: 12px;
}
.message-head {
  height: 28px;
  position: relative;
  .el-button {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.message-wrap {
  border: 1px solid #d8d8d8;
  border-radius: 2px;
}
.to-send {
  height: 112px;
}
.to-send textarea {
  resize: none;
  font-family: MicrosoftYaHei;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0;
}
.template-word-head {
  height: 40px;
  line-height: 40px;
  padding-left: 8px;
  color: rgba(0, 0, 0, 0.7);
  font-weight: bold;
  border-bottom: 1px solid #d8d8d8;
}
ul.template-word-content {
  border-top: 1px solid #d8d8d8;
  padding-left: 0px;
  margin: 0px;
  width: 296px;
  height: 80px;
  overflow-y: auto;
  overflow-x: hidden;
}
ul.template-word-content li {
  height: 24px;
  line-height: 24px;
  //overflow-x: hidde ;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ul.template-word-content li:hover {
  background-color: #d8d8d8;
  border-radius: 2px;
  cursor: pointer;
}
ul.template-word-content li i {
  height: 16px;
  width: 16px;
  margin-right: 8px;
}
.el-textarea__inner {
  border: 1px solid #fff !important;
}
.el-scrollbar_view li {
  height: 32px;
  line-height: 32px;
}
.sent-type {
  height: 40px;
  margin-top: 8px;
  display: flex;
}
.btn-wrap {
  text-align: right;
  padding: 11px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  margin: 0 -12px;
  background: #f5f5f5;
}

.send-success {
  color: #02bf0f;
}
.send-failure {
  color: #fa3239;
  position: relative;
  padding-right: 28px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  i {
    position: absolute;
    right: 0;
    color: rgba(0, 0, 0, 0.7);
    cursor: pointer;
  }
}
.broadcast-table::v-deep {
  border: 0;
  &::before,
  &::after {
    display: none;
  }
  th {
    background: none !important;
    border: 0;
    padding: 5px;
    height: 30px;
    color: rgba(0, 0, 0, 0.4);
  }
  th:not(:first-child) > .cell:after {
    display: none;
  }
  td {
    border: 0;
    padding: 5px;
    height: 30px;
  }
  .el-table__body-wrapper::before {
    display: none;
  }
}
</style>
<style>
.broadcast-type .el-form-item {
  margin-bottom: 8px !important;
  font-size: 12px;
}
.broadcast-type .el-form-item__content {
  font-size: 12px !important;
}
.sent-type .el-checkbox {
  /* width:146px; */
  margin-left: 0px;
}
.dialog-content .query-list .el-checkbox-group .el-checkbox {
  display: block;
  height: 32px;
  line-height: 32px;
  margin-left: 0px !important;
}
.location-wrap .el-dialog__body .el-dialog__body-wrapper {
  padding: 0px !important;
}
.el-radio {
  max-width: 350px;
}
.el-radio__label {
  display: inline;
}
</style>
