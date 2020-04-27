<!-- 出库 -->
<template>
  <Card id="card-body">
    <Form inline :model="query_form" label-position="right" >
      <FormItem label="出库单号:" style="display: inline-flex">
        <Input v-model="query_form.no" clearable placeholder="查询出库单号" style="width: 110px"/>
      </FormItem>
      <FormItem label="出库操作人:" style="display: inline-flex">
        <Input v-model="query_form.user_name" placeholder="出库人姓名" clearable  style="width: 120px"/>
      </FormItem>
      <FormItem label="出库时间范围:" style="display: inline-flex">
        <DatePicker type="datetimerange" v-model="query_form.time" format="yyyy-MM-dd" style="width: 250px;"></DatePicker>
      </FormItem>
      <FormItem style="display: inline-flex">
        <Button type="info" @click="btn_query">查询</Button>
        <Button type="success" @click="btn_add">新增出库</Button>
      </FormItem>
    </Form>

    <Table :columns="table.columns" :data="table.data" :loading="table.loading" :height="height-265" stripe border/>
    <Page size="small" :total="table.count" :current="table.page" :page-size="table.pageSize"
          @on-change="chgPage" @on-page-size-change="chgPageSize" show-sizer show-total style="margin-top: 16px;"></Page>
    <out-order v-model="info.seen" :info="info" @addchg="addChg" @cancel="orderCancel"></out-order>
    <out-display v-model="desc.show" :desc="desc" @cancel="displayCancel"> </out-display>
  </Card>
</template>

<script>
import { post, baseUrl} from '@/libs/axios-cfg'
import { formatDate } from '@/libs/util'
import outOrder from "./components/out_order"
import outDisplay from "./components/out_display"
export default {
  name: "out_store",
  components: {outOrder, outDisplay},
  data () {
    return {
      height: 100,
      query_form: {
        no: '',
        user_name: '',
        time: [],
      },
      info: {
        seen: false,
        value: '',
      },
      desc: {
        show: false,
        value: '',
      },
      table: {
        loading: false,
        page: 1,
        pageSize: 10,
        count: 13,
        data: [],
        all_data: [],
        columns: [
          {
            title: 'ID',
            key: 'id',
            minWidth: 60,
            align: 'center'
          },
          {
            title: '出库单编号',
            key: 'outNo',
            minWidth: 130,
            align: 'center'
          },
          {
            title: '出库单操作人',
            key: 'userName',
            minWidth: 180,
            align: 'center'
          },
          {
            title: '出库操作人',
            key: 'outUser',
            minWidth: 180,
            align: 'center'
          },
          {
            title: '出库(单)日期',
            key: 'createAt',
            align: 'center',
            minWidth: 180,
            render: function (h, params) {
              return h('div', formatDate(new Date(params.row.createAt), 'yyyy-MM-dd hh:mm:ss'))
            }
          },
          {
            title: '总价(元)',
            key: 'totalCost',
            minWidth: 150,
            align: 'center'
          },
          {
            title: '状态',
            key: 'status',
            minWidth: 80,
            align: 'center',
            render: (h, param) => {
              let status = param.row.status;
              let desc = '未出库';
              if (status === 1) {
                desc = '未出库';
              } else if (status === 2) {
                desc = '已出库';
              } else {
                desc = '未出库';
              }
              return h('p', desc);
            }
          },
          {
            title: '操作',
            align: 'center',
            minWidth: 190,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showDetail(params.row);
                    }
                  }
                }, '查看'),
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: '您确定要将该订单货物出库吗?',
                    placement: 'left',
                  },
                  on: {
                    'on-ok': () => {
                      this.sub_store(params.row);
                    },
                  },
                }, [
                  h('Button', {
                    style: {
                      // margin: '0 2px',
                      marginLeft: '2px',
                    },
                    props: {
                      type: 'warning',
                      size: 'small',
                      disabled: params.row.status === 2 ? true : false
                    },
                  }, '出库'),
                ]),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small',
                    // icon:"ios-download-outline",
                  },
                  style: {
                    // marginRight: '5px',
                  },
                  on: {
                    click: () => {
                      this.export(params.row);
                    }
                  }
                }, '导出')
              ])
            }
          }
        ],
      }
    }
  },
  methods: {
    btn_query (){
      this.list_out();
    },
    btn_add () {
      this.info.seen = true;
    },
    showDetail (info) {
      // console.log('showDetail=' + JSON.stringify(info));
      info.show = true;
      this.desc.show = true;
      if (info && info.content && typeof info.content === 'string') {
        info.content = JSON.parse(info.content);
      }
      this.desc = info;
    },
    async add_store (row) {
      // console.log('add_store=' + JSON.stringify(row));
      try {
        let res = await post('/store/out/add', {
          addUser: localStorage.getItem('account'),
          info: JSON.stringify(row)
        });
        // console.log(res);
        if (res.status == 1) {
          this.list_out();
        }
      } catch (error) {
        this.$throw(error)
      }
    },
    async sub_store (row) {
      try {
        let res = await post('/store/out/sub', {
          outUser: localStorage.getItem('account'),
          outNo: row.outNo,
          content: 'object' === typeof row.content ? JSON.stringify(row.content) : row.content
        });
        this.table.data = res.data.records;
        // console.log(res);
      } catch (error) {
        this.$throw(error)
      }
    },
    async list_out (page=this.table.page, pageSize=this.table.pageSize) {
      try {
        let res = await post('/store/out/list', {
          userName: this.query_form.user_name,
          outNo: this.query_form.no,
          time: this.query_form.time,
          page: 1,
          pageSize: 1000000000
        });
        this.table.data = res.data.records;
        this.table.all_data = res.data.records;
        this.table.count = this.table.all_data.length;
        if (this.table.count >= 1) {
          this.chgPage(1);
        }
      } catch (error) {
        this.$throw(error)
      }
    },
    export(row) {
      const a = document.createElement('a');
      //给a标签设置链接属性
      a.href = baseUrl + '/store/out/export?type=3&outNo=' + row.outNo;
      //调用点击事件
      a.click();
    },
    addChg(res) {
      this.table.data = res.data.records;
    },
    chgPage(page) {
      let pageSize = this.table.pageSize;
      let arr = this.table.all_data;
      let len = this.table.all_data.length;
      var offset = (page - 1) * pageSize;
      this.table.data = (offset + pageSize >= len) ? arr.slice(offset, len) : arr.slice(offset, offset + pageSize);
    },
    chgPageSize(pageSize) {
      this.table.pageSize = pageSize;
      this.chgPage(1);
    },
    orderCancel() {
      this.info.seen = false;
    },
    displayCancel(up) {
      this.desc = {show: false};
    }
  },
  created() {
    this.list_out();
    this.height = document.body.clientHeight;
  }
}
</script>

<style scoped>

</style>
