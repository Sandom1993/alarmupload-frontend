<template>
  <span class="s-table-type">

    <!-- 标签 -->
    <el-tag v-if="type === 'tag' && data" :type="data.type" :color="data.color">{{ data.label }}</el-tag>

    <!-- 文字图标 -->
    <i
      v-if="type === 'icon-font'"
      :style="{ color: data.color, 'font-size': data['font-size'] }"
      class="super-icon-font"
      v-html="data.icon"/>

    <!-- 行内元素 -->
    <span v-if="type === 'span'" :style="{ color: data.color, 'font-size': data['font-size'] }">{{ data.label }}</span>

    <!-- 行内元素加图标 -->
    <div v-if="type === 'iconSpan'" style="display: flex;align-items: center;">
      <div :style="{ height: '12px', width: '12px', backgroundColor: data.color, marginRight: '8px' }"/>
      <span :style="{ 'font-size': data['font-size'] }">{{ data.label }}</span>
    </div>
  </span>
</template>

<script>
import { findIndexObject } from '../utils/common'

export default {
  props: {
    text: {
      type: [Number, String],
      required: true
    },
    list: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'span'
    }
  },
  data () {
    const { text, list } = this
    const item = findIndexObject(list, ['value', text])
    return {
      data: item
    }
  },
  watch: {
    text (text) {
      const { list } = this
      this.data = findIndexObject(list, ['value', text])
    }
  }
}
</script>
