<template>
  <Card>
    <Form class="query_form">
      <FormItem label="货物类别:" style="display: inline-flex">
        <Select v-model="query_form.first_level" @on-change="sel_first" style="width:150px" clearable filterable>
          <Option v-for="item in query_form.categorys[0]" :value="item.code" :key="item.code">{{ item.cnName }}-{{ item.code }}-{{ item.enName }}
          </Option>
        </Select>
      </FormItem>
<!--      <FormItem label="货物名称:" style="display: inline-flex; margin-left: 20px">-->
<!--        <Select v-model="query_form.sec_level" style="width:250px" clearable filterable>-->
<!--          <Option v-for="item in query_form.categorys[query_form.first_level]" :value="item.code" :key="item.code">{{ item.cnName }}-{{ item.code }}-{{ item.enName }}-->
<!--          </Option>-->
<!--        </Select>-->
<!--      </FormItem>-->
      <FormItem style="display: inline-flex; margin-left: 20px">
        <Button @click='btn_query' type="success" style="width: 80px">查询</Button>
      </FormItem>
      <FormItem style="display: inline-flex; margin-left: 20px">
        <Button @click='add_modal' type="success" style="width: 80px">添加</Button>
      </FormItem>
    </Form>
    <Table :data="table.data" :columns="table.columns" stripe border :height="height - 230"></Table>
    <!-- 新增货物类型模态对话框 -->
    <Modal v-model="modal.seen" title="新增货物类别" :width="500">
      <Form class="modal_form">
        <FormItem label="货物类别:" style="display: inline-flex">
          <Select v-model="query_form.first_level" @on-change="sel_first" style="width:340px" clearable filterable>
            <Option v-for="item in query_form.categorys[0]" :value="item.code" :key="item.code">{{ item.cnName }}-{{ item.code }}-{{ item.enName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="货物名称(中文):" style="display: inline-flex">
          <Input v-model="modal_form.cn_name" placeholder="茄子" type="text" style="width: 300px"></Input>
        </FormItem>
        <FormItem label="货物名称(拼音):" style="display: inline-flex">
          <Input v-model="modal_form.en_name" placeholder="qiezi" type="text" style="width: 300px"></Input>
        </FormItem>
        <FormItem label="备注:" style="display: inline-flex">
          <Input v-model="modal_form.extra" type="textarea" :rows="4" style="width: 365px"></Input>
        </FormItem>
      </Form>
      <div slot="footer" style="height: 25px">
        <Button @click='add_category' :loading='modal.loading' type="success" style="width: 150px">新增货物类别</Button>
        <Button @click='() => {modal.seen = false;}' type="info" style="width: 80px">取消</Button>
      </div>
    </Modal>
  </Card>

</template>

<script>
import { post } from '@/libs/axios-cfg'
export default {
  name: "Category",
  data () {
    return {
      height: 100,
      query_form: {
        first_level: '',
        sec_level: '',
        categorys: {},
      },
      modal: {
        seen: false,
        loading: false,
      },
      modal_form: {
        cn_name: '',
        en_name: '',
        extra: '',
      },
      table: {
        data: [],
        backup: [],
        columns: [
          {
            title: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            sortable: true,
          },
          {
            title: '货物类别名称',
            key: 'cnName',
            width: 200,
            align: 'center',
          },
          {
            title: '货物类别英文名称',
            key: 'enName',
            align: 'center',
            width: 200,
            sortable: true,
          },
          {
            title: '货物类别编码',
            key: 'code',
            width: 140,
            align: 'center',
            sortable: true,
          },
          {
            title: '父类名称',
            key: 'pname',
            align: 'center',
            width: 200,
            sortable: true,
          },
          {
            title: '备注',
            key: 'extra',
            align: 'center',
          }
        ],
      }
    }
  },
  methods: {
    sel_first () {
        console.log('first=' + this.query_form.first_level);
    },
    add_modal () {
      this.modal.seen = true;
    },
    btn_query() {
      if (typeof this.query_form.first_level == "undefined" || this.query_form.first_level == null
      || this.query_form.first_level == "" ) {
        this.all_category();
        } else {
          this.table.data = this.query_form.categorys[this.query_form.first_level];
        }
    },
    async add_category () {
      if (this.query_form.first_level.length < 1) {
        this.$Message.info('货物类别不能为空!');
        return;
      }
      if (!this.modal_form.cn_name.trim()) {
        this.$Message.info('中文名存在空格');
        return;
      }
      if (!this.modal_form.en_name.trim()) {
        this.$Message.info('拼音名存在空格');
        return;
      }

      try {
        this.modal.loading = true;
        let res = await post('/system/category/add', {
          p_code: this.query_form.first_level,
          cn_name: this.modal_form.cn_name,
          en_name: this.modal_form.en_name
        });
        this.all_category();
        this.modal.seen = false;
      } catch (error) {
//        this.$throw(error)
        this.$Message.error({
          content: error,
          duration: 20,
          closable: true,
        });
      } finally {
        this.modal.loading = false;
      }
    },
    /**
     * @description 获取仓库全部的货物类别category
     */
    async all_category() {
      try {
        let res = await post('/system/category/list', {})
        let dataList = [];
        let pMenus = {};
        res.data[1][0].forEach(row => {
          pMenus[row.code] = row;
        });
        // console.log(pMenus);

        res.data[0].forEach(row => {
            if (row.pcode !== "0") {
              row.pname = pMenus[row.pcode].cnName;
              dataList.push(row);
            }
          });
        this.table.data = dataList;
        this.table.backup = res.data[0];
        this.query_form.categorys = res.data[1];
        // console.log(res);
      } catch (error) {
        this.$throw(error)
      }
    },
  },
  mounted () {
    this.all_category();
    this.height = document.body.clientHeight;
  },
}
</script>

<style scoped>
</style>
