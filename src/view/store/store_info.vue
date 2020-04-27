<!-- 当前库存 -->
<template>
  <Card>
    <Form inline :model="query_form" label-position="right" >
      <FormItem label="类别:" style="display: inline-flex">
        <Select v-model="query_form.code" style="width:150px" clearable filterable>
          <Option v-for="k in query_form.categorys" :value="k.code" :key="k.code">{{ k.cnName }}-{{ k.enName }}</Option>
        </Select>
      </FormItem>
      <FormItem style="display: inline-flex">
        <Button type="info" @click="btn_query">查询</Button>
      </FormItem>
    </Form>

    <Table :row-class-name="rowClassName"  :columns="table.columns" :data="table.data" :height="height - 230"/>

    <Modal v-model="modal.seen" :title=modal.title :mask-closable="false" :width="400" :closable="false">
      <Form>
        <FormItem label="名称:">
          <Input v-model="modal.cnName" disabled type="text" style="width: 180px"/>
        </FormItem>
        <FormItem label="名称拼音:">
          <Input v-model="modal.enName" disabled type="text" style="width: 150px"/>
        </FormItem>
        <FormItem label="类别编码:">
          <Input v-model="modal.code" disabled type="text" style="width: 150px"/>
        </FormItem>
        <FormItem label="重量(市斤):">
          <InputNumber v-model="modal.weight" disabled type="text" style="width: 160px"/>
        </FormItem>
        <FormItem label="阈值(市斤):">
          <InputNumber v-model="modal.threshold" type="text" style="width: 160px"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="info" @click="update()">确定</Button>
        <Button type="success" @click="()=>{this.modal.seen = false}">取消</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import { post } from '@/libs/axios-cfg'
export default {
  name: "store_info",
  data () {
      return {
        height: 100,
        query_form: {
          code: '',
          categorys: [],
        },
        modal: {
          seen: false,
          title: '库存详情及阈值设置',
          code: '',
          cnName: '',
          enName: '',
          weight: 0.0,
          threshold: 0.0
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
              minWidth: 100,
              align: 'center'
            },
            {
              title: '名称',
              key: 'cnName',
              minWidth: 250,
              align: 'center'
            },
            {
              title: '名称拼音',
              key: 'enName',
              minWidth: 250,
              align: 'center'
            },
            {
              title: '当前可用库存(市斤)',
              key: 'weight',
              align: 'center',
              minWidth: 250,
              sortable: true
            },
            {
              title: '库存阈值(市斤)',
              key: 'threshold',
              minWidth: 130,
              align: 'center',
            },
            {
              title: '操作',
              align: 'center',
              minWidth: 100,
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
    btn_query() {
      this.list_store();
    },
    async update() {
      try {
        let res = await post('/store/in/update', {
          code: this.modal.code,
          info: JSON.stringify(this.modal)
        });
        this.list_store();
      } catch (error) {
        this.$throw(error)
      } finally {
        this.modal.seen = false;
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
    },
    rowClassName (row, index) {
      if (row.threshold >= row.weight) {
        return 'store_info-table-error-row';
      }
      return '';
    }
  },
  created() {
    this.list_store();
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
