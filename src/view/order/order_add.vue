<template>
<Card>
  <Form label-position="left">
    <FormItem label="订单编号:" required style="display: inline-flex; height: 15px">
      <Input v-model="add.order_no" disabled type="text" style="width: 120px"/>
    </FormItem>
    <FormItem label="操作人:" required style="display: inline-flex; margin-left: 10px; height: 15px">
      <Input v-model="add.user_name" disabled type="text" style="width: 150px"/>
    </FormItem>
    <FormItem label="供货商:" required style="display: inline-flex; margin-left: 10px; height: 15px">
      <Select v-model="add.supplier" style="width:250px" clearable filterable>
        <Option v-for="item in add.suppliers" :value="item.code" :key="item.code">{{ item.name }}</Option>
      </Select>
    </FormItem>
    <FormItem style="display: inline-flex; margin-left: 10px; height: 15px">
      <Button @click='add_order' :loading='loading' type="success" style="width: 150px">新增订单</Button>
    </FormItem>
  </Form>
  <Table ref="selection" :data="table.data" :columns="table.columns" @on-selection-change="on_select" :loading="table.loading" stripe border :height="height - 200"></Table>
</Card>
</template>

<script>
    import { post } from '@/libs/axios-cfg'
    import { formatDate } from '@/libs/util'
    import baseData from '@/libs/constants.js'
    export default {
        name: "order_add",
        data() {
            return {
              height: 100,
              loading: false,
              query_form: {
                first_level: '',
                sec_level: '',
                categorys: {},
                result: [],
                res_list: [],
                res_hash:{}
              },
              add: {
                order_no: '',
                user_name: '',
                supplier: '',
                suppliers: baseData.suppliers,
                items: []
              },
              table: {
                loading: false,
                data: [],
                backup: [],
                columns: [
                  {
                    title: 'id',
                    key: 'id',
                    width: 60,
                    align: 'center',
                    sortable: true,
                  },
                  {
                    type: 'selection',
                    width: 60,
                    align: 'center'
                  },
                  {
                    title: '食材类别名称',
                    key: 'cnName',
                    width: 150,
                    align: 'center',
                  },
                  {
                    title: '食材类别英文',
                    key: 'enName',
                    align: 'center',
                    width: 180,
                    sortable: true,
                  },
                  {
                    title: '食材类别编码',
                    key: 'code',
                    width: 150,
                    align: 'center',
                    sortable: true,
                  },
                  {
                    title: '父类食材名称',
                    key: 'pname',
                    align: 'center',
                    width: 150,
                    sortable: true,
                  },
                  {
                    title: '重量(市斤)',
                    key: 'weight',
                    align: 'center',
                    minWidth: 150,
                    render: (h, params) => {
                      return h('InputNumber', {
                        props: {
                          value: params.row.weight
                        },
                        style: {
                          minWidth:'150px',
                        },
                        on: {
                          'on-change': (event) => {
                            params.row.weight = event;
                            this.query_form.res_hash[params.row.code] = params.row;
                          }
                        }
                      });
                    }
                  },
                  {
                    title: '单价(元/市斤)',
                    key: 'price',
                    align: 'center',
                    minWidth: 150,
                    render: (h, params) => {
                      return h('InputNumber', {
                        props: {
                          value: params.row.price
                        },
                        style: {
                          minWidth:'150px',
                        },
                        on: {
                          'on-change': (event) => {
                            params.row.price = event;
                            this.query_form.res_hash[params.row.code] = params.row;
                          }
                        }
                      });
                    }
                  }
                ],
              }
            }
        },
        methods: {
          async add_order() {
            if (!this.add.supplier) {
              this.$Message.warning("供货商不能为空!");
              return;
            }
            let supplier = '';
            this.add.suppliers.forEach((item) => {
              if (item.code === this.add.supplier) {
                supplier = item.name;
              }
            });
            let id = 1;
            this.add.items = [];
            this.query_form.res_list.forEach(k=>{
                let val = this.query_form.res_hash[k.code];
                if (val) {
                  let item = {};
                  item.id = id;
                  item.first_level = val.pcode;
                  item.sec_level = val.code;
                  item.first_name = val.pname;
                  item.sec_name = val.cnName;
                  item.sec_pinyin = val.enName;
                  item.weight = val.weight;
                  item.price = val.price;
                  this.add.items.push(item);
                  id = id + 1;
                }
              }
            );
            if (this.add.items.length === 0) {
              this.$Message.warning("食材类别不能为空!");
              return;
            }
            try {
              this.loading = true;
              let res = await post('/order/info/add', {
                content: JSON.stringify(this.add.items),
                orderNo: this.add.order_no,
                userName: this.add.user_name,
                supplier: supplier,
              });
              // this.result_data = res.data.records;
              this.$Message.info('新增食材订单成功!');
            } catch (error) {
              this.$throw(error)
            } finally {
              this.loading = false;
              this.$refs.selection.selectAll(false);
            }
          },
          on_select(all) {
            this.query_form.res_list=all;
          },
          async all_category() {
            try {
              this.table.loading = true;
              let res = await post('/system/category/list', {})
              let dataList = [];
              let pMenus = {};
              res.data[1][0].forEach(row => {
                pMenus[row.code] = row;
              });
              res.data[0].forEach(row => {
                if (row.pcode !== "0") {
                  row.pname = pMenus[row.pcode].cnName;
                  dataList.push(row);
                }
              });
              this.table.data = dataList;
              this.table.backup = res.data[0];
              this.query_form.categorys = res.data[1];
            } catch (error) {
              this.$throw(error)
            } finally {
              this.table.loading = false;
            }
          },
          init() {
            this.add.user_name = localStorage.getItem('account');
            var outTradeNo="";  //订单号
            for(var i=0;i<3;i++) {//6位随机数，用以加在时间戳后面
              outTradeNo += Math.floor(Math.random()*10);
            }
            this.add.order_no = formatDate(new Date(), 'yyyyMMdd') + outTradeNo;
          }
        },
        created() {
          this.init();
          this.all_category();
          this.height = document.body.clientHeight;
        }
    }
</script>

<style scoped>

</style>
