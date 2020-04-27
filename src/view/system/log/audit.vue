<template>
  <Card id="card-body">
    <Form inline :model="query_form" label-position="right" >
      <FormItem label="操作人:" style="display: inline-flex">
        <Input v-model="query_form.user_name" placeholder="操作人姓名" clearable  style="width: 150px"/>
      </FormItem>
      <FormItem label="操作类型:" style="display: inline-flex">
        <Select v-model="query_form.action" style="width:200px" clearable filterable>
          <Option v-for="k in query_form.actions" :value="k.name" :key="k.name">{{ k.name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="时间范围:" style="display: inline-flex">
        <DatePicker type="datetimerange" v-model="query_form.time" format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></DatePicker>
      </FormItem>
      <FormItem style="display: inline-flex">
        <Button type="info" :loading="query_form.loading" @click="btn_query">查询</Button>
      </FormItem>
    </Form>

    <Table ref="orderTable" :columns="table.columns" :data="table.data" :loading="table.loading" stripe border/>
    <Page :total="table.total" class="tr" @on-change="pageChange" :current.sync="table.current" :page-size="table.page"
          @on-page-size-change="pageSizeChange" show-elevator show-sizer></Page>

    <Detail :info="info" :base="base" @on-close="closeDetail"></Detail>
  </Card>
</template>

<script>
import { post } from '@/libs/axios-cfg'
import dayjs from "dayjs";
import vueJsonEditor from 'vue-json-editor';
import Detail from './components/detail';
export default {
  name: "audit",
  components: {
    Detail,
    vueJsonEditor
  },
  data () {
    return {
      query_form: {
        loading: false,
        user_name: '',
        time: [],
        action:"新增一个订单",
        actions: [
          {
            name: "新增一个订单"
          },
          {
            name: "入库一个订单"
          },
          {
            name: "新增一个消费需求单"
          },
          {
            name: "出库一个消费需求单"
          }
        ]
      },
      info: {},
      base: {
        seen: false,
      },
      table: {
        loading: false,
        page:1,
        pageSize:10,
        total: 10,
        data: [],
        columns: [
          {title: '用户名', key: 'username', minWidth: 250, align: 'center'},
          {title: '动作名称', key: 'actionName', minWidth: 200},
          // {title: 'IP', key: 'ip',render:(h,params)=>{
          //     let ip = params.row.ip;
          //     let ipSplit = ip.split(".")
          //     if(ipSplit.length==4){
          //       return h('span',ipSplit[0]+'.'+'***'+'.'+ipSplit[2]+'.'+ipSplit[3])
          //     }
          //     return h('span',ip)
          //   }},
          // {title: '请求类型', key: 'ajax',render:(h,params)=>{
          //     return h('span',params.row.ajax == 0 ? '普通请求' : 'AJAX请求')
          //   }, width: '100'},
          {title: '订单编号', key: 'no', minWidth: 200,
            render:(h,params)=>{
              let content = null;
              if (params.row.params) {
                content = JSON.parse(params.row.params);
              } else {
                return null;
              }
              let no = content[0].outNo;
              if (!no) {
                no = content[0].orderNo;
              }
              return h('div', no);
              // return h('pre', JSON.stringify(JSON.parse(content[0].content), null, 4));
            },
          },
          {title: '请求地址', key: 'uri', minWidth: 200},
          // {title: '请求方法', key: 'httpMethod', width: '150'},
          {
            title: '操作日期',
            minWidth: 200,
            key: 'createDate',
            render:(h,params)=>{
              return h('span',dayjs(params.row.createDate).format('YYYY年MM月DD日 HH:mm:ss'))
            },
            sortable: true
          },
          {
            title: '操作',
            align: 'left',
            minWidth: 120,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small',
                  },
                  style: {
                    marginLeft: '0px',
                    // width: '35px',
                  },
                  on: {
                    click: () => {
                      if (this.query_form.action === '新增一个订单' || this.query_form.action === '入库一个订单') {
                        this.base.flag = true;
                      } else {
                        this.base.flag = false;
                      }
                      let aa = JSON.parse(params.row.params);
                      // aa[0].content = JSON.parse(aa[0].content);
                      this.info.content = JSON.parse(aa[0].content);
                      this.info.orderNo = aa[0].orderNo ? aa[0].orderNo : aa[0].outNo;
                      this.info.name = params.row.username ? params.row.username : params.row.addUser;
                      this.info.createDate = dayjs(params.row.createDate).format('YYYY年MM月DD日 HH:mm:ss');
                      this.base.seen = true;
                      // this.info = JSON.stringify(this.info);
                      // console.log(this.info);
                    }
                  }
                }, '查看')
              ])
            }
          }
        ]
      }
    }
  },
  methods: {
    btn_query() {
      this.getData();
    },
    pageChange(page) {
      this.table.page = page;
      this.getData();
    },
    pageSizeChange(pageSize) {
      this.table.pageSize = pageSize;
      this.getData();
    },
    /**
     * @description 获取用户列表
     */
    async getData(){
      this.query_form.loading = true;
      try {
        let res = await post('/system/log/audit',{
          userName: this.query_form.user_name,
          // time: this.query_form.time,
          opType: this.query_form.action,
          page:this.table.page,
          pageSize:this.table.pageSize
        })
        // console.log(res);
        this.table.total = res.data.total;
        this.table.data = res.data.records;
        this.table.page = res.data.pages;
        this.table.current = res.data.current;
      } catch (error) {
        this.$throw(error)
      }
      this.query_form.loading = false;
    },
    closeDetail() {
      this.base = {seen: false};
    }
  },
  created() {
    this.getData();
  }
}
</script>

<style scoped>

</style>
