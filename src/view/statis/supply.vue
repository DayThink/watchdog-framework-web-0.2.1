<template>
  <Card id="card-body">
    <Form inline :model="query_form" label-position="right" >
      <FormItem label="时间范围:" style="display: inline-flex">
        <DatePicker v-model="query_form.time" type="daterange" :options="options2" placement="bottom-start" placeholder="Select date" style="width: 300px"></DatePicker>
      </FormItem>
      <FormItem style="display: inline-flex">
        <Button type="info" :loading="query_form.loading" @click="btn_query">查询</Button>
      </FormItem>
      <FormItem v-if="query_form.shown" style="display: inline-flex">
        <Button type="info" @click="exportData">导出</Button>
      </FormItem>
    </Form>

    <div v-if="query_form.shown">
      <div align="center" style="font-size: 20px">
        在该时间范围内，共选用了<Span style="font-size: 30px; color: #dc9387">{{info.supplySum}}</span>家供应商，下了<Span style="font-size: 30px; color: #dc9387">{{info.orderSum}}</Span>个订单,
        总开支<Span style="font-size: 30px; color: #dc9387">{{info.costSum}}</Span>元
      </div>
      <Table ref="table" :columns="columns" height="500" :data="newData" border :span-method="handleSpan"></Table>
    </div>
    </Card>
</template>

<script>
  import { post } from '@/libs/axios-cfg'
  import dayjs from "dayjs";
  import baseData from "./components/data";
  export default {
    name: "supply",
    data () {
      return {
        query_form: {
          shown: false,
          loading: false,
          time: []
        },
        info: {},
        options2: baseData.options2,
        columns: [
          {
            title: '供应商',
            key: 'supply',
            minWidth: 200,
            align: 'center'
          },
          {
            title: '食材名称',
            key: 'cnName',
            minWidth: 150,
            align: 'center'
          },
          {
            title: '食材拼音',
            key: 'enName',
            minWidth: 100,
            align: 'center'
          },
          {
            title: '食材编码',
            key: 'code',
            minWidth: 50,
            align: 'center'
          },
          {
            title: '重量(市斤)',
            key: 'wsum',
            minWidth: 80,
            align: 'center'
          },
          {
            title: '费用(元)',
            key: 'psum',
            minWidth: 80,
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
            }
          }
        ],
        newData: []
      }
    },
    methods: {
      async btn_query() {
        try {
          this.query_form.loading = true;
          if (!this.query_form.time[0]) {
            this.$Message.warning('时间范围不能为空');
            return;
          }
          let res = await post('/statis/supply/list', {
            dateRange: this.query_form.time,
          });
          if (res.status === 1) {
            this.query_form.shown = true;
            this.info = res.data;
            // this.data = res.data.supplyDTOS;
            // let that = this;
            this.newData = this.integratedData(res.data.supplyDTOS);
          } else {
            this.$Message.error(res.msg);
          }
        } catch (error) {
          this.$throw(error)
        } finally {
          this.query_form.loading = false;
        }
      },
      // 被整理的数组中相同age的元素需放在一块，否则还要再整理数据（暂未处理）
      integratedData(data) {
        let that = this;
        let arrId = [];
        data.forEach(i => {
          !arrId.includes(i.supply) ? arrId.push(i.supply) : arrId;
        });
        let arrObj = [];
        arrId.forEach(j => {
          arrObj.push({
            id: j,
            num: 0
          })
        })
        data.forEach(k => {
          arrObj.forEach(l => {
            k.supply === l.id ? l.num ++ : l.num;
          })
        })
        data.forEach(m => {
          arrObj.forEach(n => {
            if(m.supply === n.id){
              if(arrId.includes(m.supply)){
                m.mergeCol = n.num;
                arrId.splice(arrId.indexOf(m.supply), 1);
              }else{
                m.mergeCol = 0;
              }
            }
          })
        })
        return data;
      },
      // 只针对相同age字段合并列，age位于第一列，columnIndex为0
      handleSpan ({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          return {
            rowspan: row.mergeCol === 0 ? 0:row.mergeCol,
            colspan: row.mergeCol === 0 ? 0:1
          };
        }
      },
      exportData() {
        let begin = dayjs(this.query_form.time[0]).format('YYYY年MM月DD日');
        let end = dayjs(this.query_form.time[1]).format('YYYY年MM月DD日');
        let title = begin+"_"+end+"_供货商报表";
        this.$refs.table.exportCsv({
          filename: title
        });
      }
    },
    created() {

    }
  }
</script>

<style scoped>

</style>
