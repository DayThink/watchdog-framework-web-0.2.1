<template>
  <Card id="card-body">
    <Form inline :model="query_form" label-position="right" >
      <FormItem label="报表维度:" style="display: inline-flex">
        <Select v-model="query_form.action" @on-change="select_action" style="width:100px" clearable filterable>
          <Option v-for="k in query_form.actions" :value="k.code" :key="k.code">{{ k.name }}</Option>
        </Select>
      </FormItem>
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
      <div v-if="query_form.action === 1">
        <in_item ref="inItem" :info="query_form.info"></in_item>
      </div>
      <div v-else>
        <out_item ref="outItem" :info="query_form.info"></out_item>
      </div>
    </div>
  </Card>
</template>

<script>
  import { post } from '@/libs/axios-cfg'
  import dayjs from "dayjs";
  import baseData from "./components/data";
  import in_item from "./components/in_item";
  import out_item from "./components/out_item";
  export default {
    name: "item",
    components: {in_item, out_item},
    data () {
        return {
          query_form: {
            shown: false,
            loading: false,
            time: [],
            action: 1,
            actions: [
              {
                code: 1,
                name: "进库"
              },
              {
                code: 2,
                name: "出库"
              }
            ],
            info: {}
          },
          options2: baseData.options2
        }
    },
    methods: {
      exportData() {
        if (this.query_form.action === 1) {
          this.$refs.inItem.exportData();
        } else {
          this.$refs.outItem.exportData();
        }
      },
      select_action() {
        this.query_form.shown = false;
      },
      async btn_query(){
        try {
          this.query_form.shown = false;
          if (!this.query_form.time[0]) {
            this.$Message.warning('时间范围不能为空');
            return;
          }
          let res = await post('/statis/item/list', {
            code: this.query_form.action,
            dateRange: this.query_form.time,
          });
          if (res.status === 1) {
            this.query_form.shown = true;
            this.query_form.info = res.data;
            this.query_form.info.time=this.query_form.time;
          } else {
            this.$Message.error(res.msg);
          }
        } catch (error) {
          this.$throw(error)
        }
      }
    },
    created() {
    }
  }
</script>

<style scoped>

</style>
