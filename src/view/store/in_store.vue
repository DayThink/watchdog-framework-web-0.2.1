<!-- 采购入库 -->
<template>
  <Card id="card-body">
    <Form inline :model="query_form" label-position="right" style="height: 40px">
      <FormItem label="订单号:" style="display: inline-flex">
        <Input v-model="query_form.no" clearable placeholder="查询订单号" style="width: 130px"/>
      </FormItem>
      <FormItem label="操作人:" style="display: inline-flex">
        <Input v-model="query_form.user_name" placeholder="入库人姓名" clearable  style="width: 120px"/>
      </FormItem>
      <FormItem label="入库时间范围:" style="display: inline-flex">
        <DatePicker type="datetimerange" v-model="query_form.time" format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></DatePicker>
      </FormItem>
      <FormItem style="display: inline-flex">
        <Button type="info" @click="btn_query">查询</Button>
      </FormItem>
    </Form>

    <Table :columns="table.columns" :data="table.data" :loading="table.loading" width="100%" stripe border ref="table"/>
    <Page :total="table.total" @on-change="chgPage" :current.sync="table.current" :page-size="table.pageSize"
    @on-page-size-change="chgPageSize" size="small" show-total show-sizer></Page>
    <detail v-if="display.seen" :info="display.info" @cancel="displayCancel"></detail>
  </Card>
</template>

<script>
import { post, baseUrl } from '@/libs/axios-cfg'
import { formatDate } from '@/libs/util'
import detail from "./components/detail";
export default {
  name: "in_store",
  components: {detail},
  data () {
    return {
      query_form: {
        no: '',
        user_name: '',
        time: [],
      },
      display: {
        seen: false,
        info: '',
      },
      table: {
        data: [],
        total: 10,
        current: 1,
        page: 1,
        pageSize: 10,
        loading: false,
        columns: [
          {
            title: 'ID',
            key: 'id',
            minWidth: 60,
            align: 'center'
          },
          {
            title: '订单编号',
            key: 'orderNo',
            minWidth: 125,
            align: 'center'
          },
          {
            title: '订单操作人',
            key: 'userName',
            minWidth: 110,
            align: 'center'
          },
          {
            title: '入库操作人',
            key: 'addUser',
            minWidth: 110,
            align: 'center'
          },
          {
            title: '供货商',
            key: 'supplier',
            minWidth: 250,
            align: 'center'
          },
          {
            title: '采购日期',
            key: 'orderDate',
            align: 'center',
            minWidth: 170,
            render: function (h, params) {
              return h('div', formatDate(new Date(params.row.orderDate), 'yyyy-MM-dd hh:mm:ss'))
            }
          },
          {
            title: '总价(元)',
            key: 'totalCost',
            minWidth: 100,
            align: 'center',
            render: (h, params) => {
              let realVal = '';
              let value = params.row.totalCost;
              if (!isNaN(value) && value!== '') {
                realVal = parseFloat(value).toFixed(2)
              } else {
                realVal = '--'
              }
              return h('div', realVal);
            },
          },
          {
            title: '状态',
            key: 'status',
            minWidth: 80,
            align: 'center',
            render: (h, param) => {
              let status = param.row.status;
              let desc = '未入库';
              if (status === 1) {
                desc = '未入库';
              } else if (status === 2) {
                desc = '已入库';
              } else {
                desc = '未入库';
              }
              return h('p', desc);
            }
          },
          {
            title: '操作',
            align: 'left',
            minWidth: 185,
            align: 'center',
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
                      this.showDetail(params.row);
                    }
                  }
                }, '查看'),
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: '您确定要将该订单货物入库吗?',
                    placement: 'left',
                  },
                  on: {
                    'on-ok': () => {
                      this.add_store(params.row);
                    },
                  },
                }, [
                  h('Button', {
                    style: {
                      // margin: '0 2px',
                      // marginLeft: '2px',
                      // width: '35px',
                    },
                    props: {
                      type: 'success',
                      size: 'small',
                      disabled: params.row.status === 2 ? true : false
                    },
                  }, '入库'),
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
                      // console.log(params.row);
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
      this.list_order();
    },
    showDetail (info) {
      // console.log('showDetail=' + JSON.stringify(info));
      info.seen = true;
      // info.categorys = this.add.categorys;
      info.window=this.window;
      this.display.info = info;
      this.display.seen = true;
    },
    async add_store (row) {
      // console.log('add_store=' + JSON.stringify(row));
      try {
          let res = await post('/store/in/add', {
          addUser: localStorage.getItem('account'),
          orderNo: row.orderNo,
          content: row.content
        });
        // console.log(res);
        if (res.status == 1) {
          this.list_order();
          this.$Message.info('入库成功!');
        }
      } catch (error) {
        this.$throw(error)
      }
    },
    async list_order () {
      try {
        let res = await post('/order/info/list', {
          userName: this.query_form.user_name,
          orderNo: this.query_form.no,
          orderDate: this.query_form.time,
          page:this.table.page,
          pageSize:this.table.pageSize
        });
        this.table.data = res.data.records;
        this.table.total = res.data.total;
      } catch (error) {
        this.$throw(error)
      }
    },
    export(row) {
      const a = document.createElement('a')
      //给a标签设置链接属性
      a.href = baseUrl + '/store/in/export?type=2&orderNo='+row.orderNo;
      //调用点击事件
      a.click();

      // try {
      //   let res = await post('/store/in/export', {
      //     orderNo: row.orderNo
      //   });
      //   this.$refs.table.exportCsv({
      //     filename: row.orderNo + "_" + row.userName,
      //     columns: [{title: "货物类别"},{title: "货物名称"},{title: "重量(市斤)"},{title: "单价(元)"}],
      //     data: res.data.rows
      //   });
      // } catch (error) {
      //   this.$throw(error)
      // }
    },
    displayCancel () {
      this.display.seen = false;
      this.list_order();
    },
    chgPage(page) {
      this.table.page = page;
      this.list_order();
    },
    chgPageSize(pageSize) {
      this.table.pageSize = pageSize;
      this.list_order();
    },
  },
  created() {
    this.list_order();
  }
}
</script>

<style scoped>

</style>
