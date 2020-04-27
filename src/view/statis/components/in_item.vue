<template xmlns="http://www.w3.org/1999/html">
<div>
  <div align="center" style="font-size: 20px">
    在该时间范围内，共购买了<Span style="font-size: 30px; color: #dc9387">{{info.itemSum}}</span>种食材，下了<Span style="font-size: 30px; color: #dc9387">{{info.orderSum}}</Span>个订单,
    开支<Span style="font-size: 30px; color: #dc9387">{{info.costSum}}</Span>元
  </div>
  <div>
    <Table ref="table" :columns="columns" :data="info.itemDTOS" :height="height - 260" stripe border />
  </div>
</div>
</template>

<script>
  import dayjs from "dayjs";

  export default {
    name: "in_item",
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
              title: '总开支(元)',
              key: 'psum',
              minWidth: 130,
              align: 'center',
              render: (h, params) => {
                let realVal = '';
                let value = params.row.psum;
                if (!isNaN(value) && value!== '') {
                  realVal = parseFloat(value).toFixed(2)
                } else {
                  realVal = '--'
                }
                return h('div', realVal);
              },
            }
          ]
      }
    },
    methods:{
      exportData() {
        let begin = dayjs(this.info.time[0]).format('YYYY年MM月DD日');
        let end = dayjs(this.info.time[1]).format('YYYY年MM月DD日');
        let title = begin+"_"+end+"_食材入库报表";
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
