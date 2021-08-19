<template>
  <el-dialog
    v-loading="loading"
    :area="408"
    :title="title"
    :visible.sync="dialogVisible"
    :modal="false"
    size="small"
    @close="closeDialog"
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
              <span>内容模板</span>
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
      <div class="message-head">上传附件：</div>
      <div class="sent-type">
        <el-upload
          ref="uploadFile"
          single-file
          class="upload-demo"
          action="/alarmupload-web/feedback/uploadAttachment.do"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :file-list="fileList">
          <el-button type="default">点击上传</el-button>
<!--          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
        </el-upload>
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
      <el-button type="primary" @click="alarmHandle">
        确认
      </el-button>
      <el-button @click="closeDialog">
        取消
      </el-button>
    </div>
  </el-dialog>
</template>
<script>

import { toTimezoneString } from '@/components/util.js'
import { ALLBY_TYPE } from '../config'
import axios from 'axios'
import { getToken } from '@/utils/common'

export default {
  name: 'BroadcastDialog',
  props: {
    tempRow: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: '处置内容'
    }
  },
  data () {
    return {
      alarmHandleAttachment: '', // 附件完整地址
      ALLBY_TYPE,
      loading: false,
      dialogVisible: false, // 是否显示 该组件dialog
      innerVisible: false, // 是否显示 内部添加模板dialog
      textarea: '', // 处置内容
      txtTemplate: [], // 处置信息模板
      form: {
        updateTextarea: ''
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
      isAdd: true, // 添加模板还是修改模板
      isEditOff: true, // 是否禁止编辑  只有选中一个时可编辑  true 不可编辑  false 可编辑 而且和当前用户userId相同
      isDeleteOff: true, // 是否可删除 选中数量大于0 可删除
      selectedEvent: [], // 选择的模板
      checkedTemp: '', // 单选中的模板

      // add by chenying 21.06.21
      fileList: []
    }
  },
  computed: {
  },
  watch: {
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
      if (n) {
        const item = this.txtTemplate.find(i => i.id === n)
        str = item.value
      }
      this.textarea = str
    }
  },
  methods: {
    openDialog () {
      this.dialogVisible = true
      this.getTemp()
    },
    closeDialog () {
      this.dialogVisible = false
      this.handleRemove()
    },
    // 获取模板文字
    getTemp () {
      axios
        .get('/alarmupload-web/descTemplate/getAllByType.do', { type: '1' }, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        }).then(res => {
          const arr = []
          if (res.data.code === '0' && res.data !== null) {
            const list = res.data.data
            list.forEach(item => {
              arr.push({
                id: item.id,
                value: item.content,
                checked: false,
                userId: item.userId
              })
            })
          }
          this.txtTemplate = arr
          // this.selectEvent();
          this.checkedTemp = ''
        })
      // const list = json.data.concat()
      // const list1 = ALLBY_TYPE
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
      const param = {
        type: 1,
        content: this.form.updateTextarea
      }
      axios
        .post('/alarmupload-web/descTemplate/add.do', param, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        }).then(res => {
          this.loading = false
          if (res.data.code === '0') {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
            this.innerVisible = false
            this.getTemp()
          } else {
            this.$message({
              type: 'error',
              message: '添加模板失败'
            })
          }
        })
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
      axios
        .post('/alarmupload-web/descTemplate/update.do', {
          type: '1',
          id: this.checkedTemp,
          content: this.form.updateTextarea
        }, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        }).then(res => {
          this.loading = false
          if (res.data.code === '0') {
            this.$message({
              type: 'success',
              message: '编辑成功'
            })
            this.innerVisible = false
            this.getTemp()
          } else {
            this.$message({
              type: 'error',
              message: '修改模板失败'
            })
          }
        })
    },
    // 删除模板文字
    deleteTemp () {
      this.$confirm('删除模板?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        axios
          .post('/alarmupload-web/descTemplate/delete.do', [this.checkedTemp], {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRF-TOKEN': getToken()
            }
          }).then(res => {
            this.loading = false
            if (res.data.code === '0') {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.innerVisible = false
              this.getTemp()
            } else {
              this.$message({
                type: 'error',
                message: '删除模板失败'
              })
            }
          })
      })
    },
    // 下发处置
    alarmHandle () {
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
        return false
      }
      const alarmDealParam = {
        alarmHandleDesc: this.textarea,
        beginTime: toTimezoneString(this.tempRow.beginTime),
        eventId: this.tempRow.eventId,
        eventType: this.tempRow.eventType,
        alarmHandleAttachment: this.alarmHandleAttachment
      }
      axios
        .post('/alarmupload-web/feedback/alarmHandle.do', alarmDealParam, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getToken()
          }
        }).then(res => {
          // console.log(res.data)
          if (res.data.code === '0') {

            this.$message.success('处置成功')
            this.loading = false
            this.dialogVisible = false
            this.$emit('on-close')
          } else {
            this.dialogVisible = false
            this.$message.error(res.data.msg)
          }
        })
    },
    // 文件上传
    beforeUpload (file) {
      this.loading = true
      const extension = file.name.split('.').slice(-1)[0]
      // eslint-disable-next-line no-mixed-operators
      if (extension !== 'jpg' && extension !== 'png' && extension !== 'jpge') {
        this.loading = false
        this.$message({
          type: 'warning',
          message: '上传文件格式出错，仅能支持jpg/png/jpge格式的文件上传'
        })
        return false
      } else {
        this.loading = false
      }
    },
    handleRemove (file, fileList) {
      this.$refs.uploadFile.clearFiles()
      this.alarmHandleAttachment = ''
    },
    handleSuccess (res) {
      if (res.code === '0') {
        this.alarmHandleAttachment = res.data
        console.log(this.alarmHandleAttachment)
          this.$message.success("上传成功")
      } else {
        this.$message.error("上传失败")
      }
      this.loading = false
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
  line-height: 28px;
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
  height: auto;
  margin-top: 3px;
  margin-bottom: 10px;
  display: flex;
}
.upload-demo {width: 100%}
.el-upload--text {
  float: left!important;
  display: block;
}
ul.el-upload-list {
  width: 250px!important;
}
.btn-wrap {
  text-align: right;
  padding: 11px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin:0 -12px -12px -12px;
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
  padding-bottom: 0 !important;
}
.el-radio {
  max-width: 350px;
}
.el-radio__label {
  display: inline;
}
</style>
