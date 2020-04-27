<template>
  <div>
    <Card id="card-body">
      <Form inline :model="query_form" label-position="right" >
        <FormItem label="订单号:" style="display: inline-flex">
          <Input v-model="query_form.no" clearable placeholder="查询订单号" style="width: 130px"/>
        </FormItem>
        <FormItem label="操作人:" style="display: inline-flex">
          <Input v-model="query_form.operator" placeholder="操作人姓名" clearable  style="width: 120px"/>
        </FormItem>
        <FormItem label="时间范围:" style="display: inline-flex">
          <DatePicker type="datetimerange" v-model="query_form.time" format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></DatePicker>
        </FormItem>
        <FormItem style="display: inline-flex">
          <Button type="info" @click="query_order">查询</Button>
<!--          <Button type="success" @click="add_order">新增订单</Button>-->
        </FormItem>
      </Form>

      <Table stripe border ref="table" :columns="result_columns" :data="result_data" :loading="result_loading"/>
      <Page :total="total" @on-change="chgPage" :current.sync="current" :page-size="pageSize"
            @on-page-size-change="chgPageSize" size="small" show-total show-sizer></Page>
      <Display v-if="display.seen" :info="display.info" @cancel="displayCancel"></Display>
      <Modal v-model="add.seen" title="新增订单" width="850" height="900" :styles="{top: '10px'}">
        <Form label-position="left">
          <FormItem label="订单编号:" required style="display: inline-flex">
            <Input v-model="add.order_no" disabled type="text" style="width: 120px"/>
          </FormItem>
          <FormItem label="操作人:" required style="display: inline-flex; margin-left: 10px">
            <Input v-model="add.user_name" disabled type="text" style="width: 150px"/>
          </FormItem>
          <FormItem label="供货商:" required style="display: inline-flex; margin-left: 10px">
            <Select v-model="add.seleted_supplier" style="width:250px" clearable filterable>
              <Option v-for="item in add.suppliers" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </FormItem>

          <FormItem v-for="(item, idx) in add.items" :value=item.id :key=item.id label="条目">
            {{item.id}}
            <Select v-model="add.items[idx].first_level" style="width:150px" clearable filterable>
              <Option v-for="item in add.categorys[0]" :value="item.code" :key="item.code">{{ item.cnName }}-{{ item.enName }}</Option>
            </Select>
            <Select v-model="add.items[idx].sec_level" style="width:150px; margin-left: 5px" clearable filterable>
              <Option v-for="item in add.categorys[add.items[idx].first_level]" :value="item.code" :key="item.code">{{ item.cnName }}-{{ item.enName }}</Option>
            </Select>
            <label style="margin-left: 10px">重量(市斤):</label>
            <InputNumber v-model="add.items[idx].weight" type="text" style="width: 100px"/>
            <label style="margin-left: 10px">单价(元/市斤):</label>
            <InputNumber v-model="add.items[idx].price" type="text" style="width: 100px"/>
            <Button @click="add_item(item)" style="margin-left: 10px">+</Button>
            <Button @click="sub_item(item, idx)" >-</Button>
          </FormItem>
        </Form>
        <div slot="footer" style="height: 25px">
          <Button type="info" @click="ok_order">新增</Button>&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="warning" @click="cancel_order">取消</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { post, baseUrl } from '@/libs/axios-cfg'
import { formatDate } from '@/libs/util'
import Display from "./components/display"
import baseData from '@/libs/constants.js'
export default {
  components: {Display},
  data () {
    return {
      query_form: {
        no: '',
        operator: '',
        time: []
      },
      display: {
        seen: false,
        info: '',
      },
      add: {
        seen: false,
        psm: '',
        weight: 0,
        price: 0,
        order_no: '',
        user_name: '',
        first_level: '',
        sec_level: '',
        categorys: '',
        cate_list: '',
        cate_hash: {},
        items: [
          {
            id: 1,
            first_level: '',
            sec_level: '',
            weight: 0.0,
            price: 0.0,
          }
        ],
        seleted_supplier: 1,
        suppliers: baseData.suppliers,
      },
      total: 10,
      current: 1,
      page: 1,
      pageSize: 10,
      result_data: [],
      result_columns: [
        {
          title: 'ID',
          key: 'id',
          minWidth: 60,
          align: 'center'
        },
        {
          title: '订单编号',
          key: 'orderNo',
          minWidth: 115,
          align: 'center'
        },
        {
          title: '订单操作人',
          key: 'userName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '供货商',
          key: 'supplier',
          minWidth: 350,
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
          minWidth: 120,
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
          title: '操作',
          align: 'center',
          minWidth: 170,
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
              }, '查看&打印'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.export(params.row)
                  }
                }
              }, '导出'),
              // h('Button', {
              //   props: {
              //     type: 'error',
              //     size: 'small'
              //   },
              //   style: {
              //     marginRight: '5px'
              //   },
              //   on: {
              //     click: () => {
              //       this.showDetail(params.row.info)
              //     }
              //   }
              // }, '变更历史')
            ])
          }
        }
      ],
      result_loading: false
    }
  },
  methods: {
    add_item (index) {
      let size = this.add.items.length;
      let last_ele = this.add.items[size - 1];

      let obj = {};
      obj.id = last_ele.id + 1;
      obj.weight = 0.0;
      obj.price = 0.0;
      obj.first_level = '';
      obj.sec_level = '';
      this.add.items.push(obj);
    },
    sub_item (item, idx) {
      // console.log('sub_item, idx=' + idx + ', id=' + item.id);
      let length = this.add.items.length;
      if (length > 1) {
        this.add.items.splice(idx, 1);
      }
    },
    /**
     * @description 获取订单列表
     */
    async query_order () {
      try {
        let res = await post('/order/info/list', {
          userName: this.query_form.operator,
          orderNo: this.query_form.no,
          orderDate: this.query_form.time,
          page: this.page,
          pageSize: this.pageSize
        });
        this.result_data = res.data.records;
        this.total = res.data.total;
      } catch (error) {
        this.$throw(error)
      }
    },
    /**
     * @description 获取仓库全部的货物类别category
     */
    async all_category () {
      try {
        let res = await post('/system/category/list', {});
        // console.log(res)
       this.add.categorys = res.data[1];
      } catch (error) {
        this.$throw(error)
      }
    },
//    新增一个采购订单
    async add_order () {
      try {
        let res = await post('/system/category/list', {});
        // console.log(res);
        this.add.cate_list = res.data[0];
        this.add.categorys = res.data[1];
        this.add.cate_list.forEach(row => {
          this.add.cate_hash[row.code] = row;
        });
        this.add.seen = true;

        this.add.user_name = localStorage.getItem('account');
        var outTradeNo="";  //订单号
        for(var i=0;i<3;i++) {//6位随机数，用以加在时间戳后面
          outTradeNo += Math.floor(Math.random()*10);
        }
        this.add.order_no = formatDate(new Date(), 'yyyyMMdd') + outTradeNo;
      } catch (error) {
        this.$throw(error)
      }
    },
    // 新增订单，在模态对话框上点击确定按钮
    async ok_order () {
      this.add.seen = false
      // console.log('ok_order=' + JSON.stringify(this.add.items));
      let supplier = '';
      this.add.suppliers.forEach((item) => {
        if (item.code === this.add.seleted_supplier) {
          supplier = item.name;
        }
      });
      this.add.items.forEach(item => {
        item.first_name = this.add.cate_hash[item.first_level].cnName;
        item.first_pinyin = this.add.cate_hash[item.first_level].enName;
        item.sec_name = this.add.cate_hash[item.sec_level].cnName;
        item.sec_pinyin = this.add.cate_hash[item.sec_level].enName;
      });
      try {
        let res = await post('/order/info/add', {
          content: JSON.stringify(this.add.items),
          orderNo: this.add.order_no,
          userName: this.add.user_name,
          supplier: supplier,
        });
        this.result_data = res.data.records;
        this.$Message.info('新增货物订单成功!');
      } catch (error) {
        this.$throw(error)
      }
    },
    cancel_order () {
      this.add.seen = false;
    },
    showDetail (info) {
      // console.log('showDetail=' + info);
      // let info_list = JSON.parse(content);
      // info_list.forEach(item => {
      //   console.log(item);
      // });
      info.seen = true;
      info.categorys = this.add.categorys;
      this.display.info = info;
      this.display.seen = true;
    },
    export(row) {
      const a = document.createElement('a')
      //给a标签设置链接属性
      a.href = baseUrl + '/store/in/export?type=1&orderNo='+row.orderNo;
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
    },
    chgPage(page) {
      this.page = page;
      this.query_order();
    },
    chgPageSize(pageSize) {
      this.pageSize = pageSize;
      this.query_order();
    }
  },
  created() {
    this.query_order();
  }
}
</script>

<style scoped>
</style>
