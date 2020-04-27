<!-- 当前库存 -->
<template>
  <Card>
    <Form inline :model="query_form" label-position="right" >
      <FormItem style="display: inline-flex">
        <Button icon="ios-download-outline" type="primary" @click="download">导出</Button>
      </FormItem>
<!--      <FormItem style="display: inline-flex">-->
<!--        <Button type="success" @click="latest_check">添加</Button>-->
<!--      </FormItem>-->
      <FormItem style="width: 300px">
        <Tooltip max-width="300" placement="right" content="期末结账操作后，账面数跟实际盘点数保持一致。">
          <Button type="success" :loading="checking" @click="do_check">期末结账</Button>
        </Tooltip>
      </FormItem>
      <FormItem v-if="latest">
        <div align="center" style="font-size: 15px">
          最近一次期末结账操作是由<Span style="font-size: 20px; color: #dc9387">{{latest.username}}</span>在<Span style="font-size: 20px; color: #dc9387">{{latest.createDate}}</Span>
        </div>
      </FormItem>
    </Form>

    <Table :columns="table.columns" :data="table.data" :height="height - 230"/>
    <Modal v-model="modal.seen" :title=modal.title :mask-closable="false" :width="400" :styles="{top: '10px'}":closable="false">
      <Form>
        <FormItem label="名称:" style="height: 15px">
          <Input v-model="modal.cnName" disabled type="text" style="width: 180px"/>
        </FormItem>
        <FormItem label="名称拼音:" style="height: 15px">
          <Input v-model="modal.enName" disabled type="text" style="width: 150px"/>
        </FormItem>
        <FormItem label="类别编码:" style="height: 15px">
          <Input v-model="modal.code" disabled type="text" style="width: 150px"/>
        </FormItem>
        <FormItem label="当前库存(市斤):" style="height: 15px">
          <InputNumber v-model="modal.weight" disabled type="text" style="width: 160px"/>
        </FormItem>
        <FormItem label="实际库存(市斤):" style="height: 15px">
          <InputNumber v-model="modal.amount" type="text" style="width: 160px"/>
        </FormItem>
        <FormItem label="原因:" style="height: 20px">
          <Input v-model="modal.reason" maxlength="100" show-word-limit type="textarea" style="width: 320px"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="info" :loading="loading" @click="update()">确定</Button>
        <Button type="success" @click="()=>{this.modal.seen = false}">取消</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import { post, get, baseUrl} from '@/libs/axios-cfg'
export default {
  name: "check",
  data () {
      return {
        loading: false,
        checking: false,
        height: 100,
        query_form: {
          code: '',
          categorys: [],
        },
        latest: '',
        modal: {
          seen: false,
          title: '库存详情及实际库存设置',
          code: '',
          cnName: '',
          enName: '',
          weight: 0.0,
          threshold: 0.0,
          amount: 0.0,
          reason: ''
        },
        table: {
          loading: false,
          data: [],
          columns: [
            {
              title: 'ID',
              key: 'id',
              minWidth: 60,
              align: 'center'
            },
            {
              title: '编码',
              key: 'code',
              minWidth: 50,
              align: 'center'
            },
            {
              title: '名称',
              key: 'cnName',
              minWidth: 100,
              align: 'center'
            },
            {
              title: '名称拼音',
              key: 'enName',
              minWidth: 100,
              align: 'center'
            },
            {
              title: '账面数(市斤)',
              key: 'weight',
              align: 'center',
              minWidth: 110,
              sortable: true
            },
            {
              title: '盘点数(市斤)',
              key: 'amount',
              align: 'center',
              minWidth: 100,
              // render: (h, params) => {
              //   return h('InputNumber', {
              //     props: {
              //       value: params.row.weight
              //     },
              //     style: {
              //       minWidth:'100px',
              //     },
              //     on: {
              //       'on-change': (event) => {
              //         console.log(event);
              //       }
              //     }
              //   });
              // }
            },
            {
              title: '差异(市斤)',
              key: 'diff',
              align: 'center',
              minWidth: 100,
            },
            {
              title: '原因',
              key: 'reason',
              align: 'center',
              minWidth: 230,
            },
            {
              title: '修改',
              align: 'center',
              minWidth: 80,
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
                        this.modal.seen = true;
                        this.modal.title = params.row.cnName + "库存详情及阈值设置";
                        this.modal.cnName = params.row.cnName;
                        this.modal.enName = params.row.enName;
                        this.modal.code = params.row.code;
                        this.modal.weight = params.row.weight;
                        this.modal.threshold = params.row.threshold;
                        this.modal.amount = params.row.amount;
                        this.modal.reason = params.row.reason;
                      }
                    }
                  }, '修改')
                ])
              }
            }
          ]
        }
    }
  },
  methods: {
    download() {
      const a = document.createElement('a')
      //给a标签设置链接属性
      a.href = baseUrl + '/store/check/export'
      //调用点击事件
      a.click();
    },
    async do_check() {
      try {
        this.checking = true;
        let res = await post('/store/check/docheck', {
          addUser: localStorage.getItem('account'),
        });
        this.list_store();
      } catch (error) {
        this.$throw(error)
      } finally {
        this.checking = false;
      }
    },
    async update() {
      try {
        this.loading = true;
        let res = await post('/store/in/update', {
          code: this.modal.code,
          info: JSON.stringify(this.modal)
        });
        this.list_store();
      } catch (error) {
        this.$throw(error)
      } finally {
        this.loading = false;
        this.modal.seen = false;
      }
    },
    async latest_check() {
      try {
        this.list_store();
        let res = await post('/store/check/latest');
        // console.log(res);
        this.latest = res.data;
        if (res.status === 1 && res.data) {
          this.latest.createDate=dayjs(res.data.createDate).format('YYYY年MM月DD日 HH:mm:ss');
        }
      } catch (error) {
        this.$throw(error)
      }
    },
    async list_store () {
      try {
        let res = await post('/store/in/list', {
          code: this.query_form.code,
          page: 1,
          pageSize: 1000
        });
        this.table.data = res.data.records;
        if (this.query_form.categorys.length === 0) {
          this.query_form.categorys = res.data.records;
        }
      } catch (error) {
        this.$throw(error)
      }
    }
  },
  created() {
    this.latest_check();
    this.height = document.body.clientHeight;
  }
}
</script>

<style>
  .ivu-table .store_info-table-info-row td{
    background-color: #2db7f5;
    color: #fff;
  }
  .ivu-table .store_info-table-error-row td{
    background-color: #ff0d6c;
    color: #fff;
  }
</style>
