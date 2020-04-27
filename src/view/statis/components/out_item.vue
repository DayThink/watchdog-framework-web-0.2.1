<template>
  <div>
    <div align="center" style="font-size: 20px">
      在该时间范围内，共使用了<Span style="font-size: 30px; color: #dc9387">{{info.itemSum}}</span>种食材，出库<Span style="font-size: 30px; color: #dc9387">{{info.orderSum}}</Span>次,
      使用食材的总重量<Span style="font-size: 30px; color: #dc9387">{{info.costSum}}</Span>KG
    </div>
    <div>
      <Table ref="table" :columns="columns" :data="info.itemDTOS" :height="height - 260" stripe border />
    </div>
  </div>
</template>

<script>
  import dayjs from "dayjs";
  export default {
    name: "out_item",
    props:{
      info:{
        type:Object
      }
    },
    data() {
        return {
          height: 100,
          columns:[
            {
              type: 'index',
              minWidth: 40,
              align: 'center'
            },
            {
              title: '食材名称',
              key: 'cnName',
              minWidth: 130,
              align: 'center'
            },
            {
              title: '食材拼音',
              key: 'enName',
              minWidth: 120,
              align: 'center'
            },
            {
              title: '食材编码',
              key: 'code',
              minWidth: 130,
              align: 'center'
            },
            {
              title: '总重量(市斤)',
              key: 'wsum',
              minWidth: 130,
              align: 'center'
            },
            {
              title: '总用量(市斤)',
              key: 'psum',
              minWidth: 130,
              align: 'center'
            }
          ]
        }
    },
    methods: {
      exportData() {
        let begin = dayjs(this.info.time[0]).format('YYYY年MM月DD日');
        let end = dayjs(this.info.time[1]).format('YYYY年MM月DD日');
        let title = begin+"_"+end+"_出库报表";
        this.$refs.table.exportCsv({
          filename: title
        });
      }
    },
    created() {
      this.height = document.body.clientHeight;
    }
  }
</script>

<style scoped>

</style>
