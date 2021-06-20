<template>
  <h-page-container>
    <h-page-header slot="pageHeader" :breadcrumb="breadcrumb" />
    <h-layout direction="vertical">
      <h-page-content flex>
        <h-page-search
          :options="options"
          style="padding:4px;margin-bottom:4px;"
        >
          <h-page-search-item>
          </h-page-search-item>
          <!-- 可设置time-container类的具体宽度，来控制时间选择器是否换行 -->
          <div class="time-container">
            <h-time-selector
              v-model="time4"
              :time-labels="timeLabels"
              :granularity-list="granularityList"
              :day-type="dayType"
              class="search-item"
            ></h-time-selector>
          </div>
        </h-page-search>
        <h-page-action class="page-data-toolbar">
          <el-button icon="h-icon-export">导出全部</el-button>
          <span class="split-line"></span>
          <el-button icon="h-icon-export">
            导出当前数据
          </el-button>
          <el-button icon="h-icon-picture">
            保存为图片
          </el-button>
          <template slot="rightAction">
            <el-radio-group v-model="tabTab" type="simple">
              <el-radio-button label="cc">进客流</el-radio-button>
              <el-radio-button label="aa">出客流</el-radio-button>
              <el-radio-button label="bb">集客力</el-radio-button>
            </el-radio-group>
            <el-button-group style="margin-left:12px">
              <el-button
                :class="{ 'is-actived': chartType === 1 }"
                title="柱状图"
                icon-border="h-icon-histogram"
                @click="chartType = 1"
              ></el-button>
              <el-button
                :class="{ 'is-actived': chartType === 2 }"
                title="折线图"
                icon-border="h-icon-associate"
                @click="chartType = 2"
              ></el-button>
              <el-button
                :class="{ 'is-actived': chartType === 3 }"
                title="列表"
                icon-border="h-icon-associate"
                @click="chartType = 3"
              ></el-button>
            </el-button-group>
          </template>
        </h-page-action>
        <div class="page-data-content">
          <div class="page-data-title" style="border: 1px solid #ccc">
            标题区域
          </div>
          <div class="page-data-subtitle" style="border: 1px solid #ccc">
            次标题内容区域
          </div>
          <div class="page-data-chart" style="border: 1px solid #ccc">
            这里是图标内容范围
          </div>
        </div>
      </h-page-content>
    </h-layout>
  </h-page-container>
</template>

<script>
export default {
  name: 'DataShowNormal',
  data () {
    return {
      options: {
        xl: 1680,
        lg: 1216,
        md: 750,
        sm: 0
      },
      breadcrumb: ['设置time-container类的具体宽度', '来控制时间选择器是否换行'],
      tabTab: 'cc',
      value: '',
      dayType: 'accurate',
      chartType: 1,
      time4: {
        type: 'day',
        currentTime: null,
        granularity: ''
      },
      timeLabels: [
        {
          label: 'day',
          name: '日'
        },
        {
          label: 'week',
          name: '周'
        },
        {
          label: 'month',
          name: '月'
        },
        {
          label: 'quarter',
          name: '季'
        },
        {
          label: 'year',
          name: '年'
        },
        {
          label: 'custom',
          name: '自定义'
        }
      ],
      granularityList: [
        {
          type: 'dayly',
          value: 'dayly',
          name: '按日统计'
        },
        {
          type: 'weekly',
          value: 'weekly',
          name: '按周统计'
        },
        {
          type: 'monthly',
          value: 'monthly',
          name: '按月统计'
        },
        {
          type: 'quarterly',
          value: 'quarterly',
          name: '按季度统计'
        },
        {
          type: 'yearly',
          value: 'yearly',
          name: '按年统计'
        }
      ]
    }
  },
  created () {},
  methods: {}
}
</script>
<style lang="scss">
</style>
