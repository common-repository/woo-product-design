(function() {
  rivets.binders.input = {
    publishes: true,
    routine: rivets.binders.value.routine,
    bind: function(el) {
      return jQuery(el).bind('input.rivets', this.publish);
    },
    unbind: function(el) {
      return jQuery(el).unbind('input.rivets');
    }
  };

  rivets.configure({
    prefix: "rv",
    adapter: {
      subscribe: function(obj, keypath, callback) {
        callback.wrapped = function(m, v) {
          return callback(v);
        };
        return obj.on('change:' + keypath, callback.wrapped);
      },
      unsubscribe: function(obj, keypath, callback) {
        return obj.off('change:' + keypath, callback.wrapped);
      },
      read: function(obj, keypath) {
        if (keypath === "cid") {
          return obj.cid;
        }
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        if (obj.cid) {
          return obj.set(keypath, value);
        } else {
          return obj[keypath] = value;
        }
      }
    }
  });

}).call(this);

(function() {
  var CanvasView, Customizer, CustomizerCollection, CustomizerModel, CustomizerView, EditLayerView, ModelView, ViewLayerView, clipByName, degToRad, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fabric.Canvas.prototype.getItemByMyID = function(myID) {
    var i, len, object, objects;
    object = null;
    objects = this.getObjects();
    i = 0;
    len = this.size();
    while (i < len) {
      if (objects[i].id && objects[i].id === myID) {
        object = objects[i];
        break;
      }
      i++;
    }
    return object;
  };

  fabric.Canvas.prototype.getItemByName = function(title) {
    var i, len, object, objects;
    object = null;
    objects = this.getObjects();
    i = 0;
    len = this.size();
    while (i < len) {
      if (objects[i].title && objects[i].title === title) {
        object = objects[i];
        break;
      }
      i++;
    }
    return object;
  };

  fabric.Object.prototype.setOriginToCenter = function() {
    var center;
    this._originalOriginX = this.originX;
    this._originalOriginY = this.originY;
    center = this.getCenterPoint();
    return this.set({
      originX: 'center',
      originY: 'center',
      left: center.x,
      top: center.y
    });
  };

  fabric.Object.prototype.setCenterToOrigin = function() {
    var originPoint;
    originPoint = this.translateToOriginPoint(this.getCenterPoint(), this._originalOriginX, this._originalOriginY);
    return this.set({
      originX: this._originalOriginX,
      originY: this._originalOriginY,
      left: originPoint.x,
      top: originPoint.y
    });
  };

  degToRad = function(degrees) {
    return degrees * (Math.PI / 180);
  };

  clipByName = function(ctx) {
    var clipRect, ctxHeight, ctxLeft, ctxTop, ctxWidth, scaleXTo1, scaleYTo1;
    this.setCoords();
    clipRect = _.where(this.canvas.getObjects(), {
      clipFor: this.clipName
    });
    if (clipRect.length > 0) {
      clipRect = clipRect[0];
    }
    scaleXTo1 = 1 / this.scaleX;
    scaleYTo1 = 1 / this.scaleY;
    ctx.save();
    ctxLeft = -(this.width / 2) + clipRect.strokeWidth;
    ctxTop = -(this.height / 2) + clipRect.strokeWidth;
    ctxWidth = clipRect.width - clipRect.strokeWidth;
    ctxHeight = clipRect.height - clipRect.strokeWidth;
    ctx.translate(ctxLeft, ctxTop);
    ctx.rotate(degToRad(this.angle * -1));
    ctx.scale(scaleXTo1, scaleYTo1);
    ctx.beginPath();
    ctx.rect(clipRect.left - this.oCoords.tl.x, clipRect.top - this.oCoords.tl.y, clipRect.width, clipRect.height);
    ctx.closePath();
    return ctx.restore();
  };

  fabric.Object.prototype.set({
    transparentCorners: false,
    borderColor: '#16A085',
    cornerColor: '#16A085',
    cornerSize: 7
  });

  CustomizerModel = (function(_super) {
    __extends(CustomizerModel, _super);

    function CustomizerModel() {
      _ref = CustomizerModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CustomizerModel.prototype.sync = function() {};

    CustomizerModel.prototype.defaults = function() {};

    CustomizerModel.prototype.indexInDOM = function() {
      var $wrapper,
        _this = this;
      $wrapper = jQuery(".pc-layers-contianer.layers").filter((function(_, el) {
        return jQuery(el).data('id') === _this.cid;
      }));
      return jQuery(".pc-layers-contianer.layers").index($wrapper);
    };

    return CustomizerModel;

  })(Backbone.DeepModel);

  CustomizerCollection = (function(_super) {
    __extends(CustomizerCollection, _super);

    function CustomizerCollection() {
      _ref1 = CustomizerCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    CustomizerCollection.prototype.nextOrder = 0;

    CustomizerCollection.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      this.on('add', this.copyCidToModel);
      this.on('reset', this.resetModel);
      this.sort();
      return this.setNextOrder();
    };

    CustomizerCollection.prototype.model = CustomizerModel;

    CustomizerCollection.prototype.resetModel = function(collection) {
      var _this;
      _this = this;
      this.sort();
      return this.setNextOrder();
    };

    CustomizerCollection.prototype.comparator = function(model) {
      return model.get(Customizer.options.mappings.LAYER_DATA + '.order');
    };

    CustomizerCollection.prototype.setNextOrder = function() {
      var last_order;
      if (this.length === 0) {
        this.nextOrder = 0;
        return;
      }
      if (this.last() !== void 0) {
        last_order = this.last().get(Customizer.options.mappings.LAYER_DATA + '.order');
        last_order = last_order >= 0 ? last_order : 0;
        this.nextOrder = parseInt(last_order) + 1;
      }
    };

    CustomizerCollection.prototype._order_by = 'order';

    CustomizerCollection.prototype.copyCidToModel = function(model) {
      model.attributes.cid = model.cid;
      model.set("order", this.nextOrder);
      model.set(Customizer.options.mappings.LAYER_DATA + '.order', this.nextOrder);
      model.set(Customizer.options.mappings.LAYER_DATA + '.zIndex', this.nextOrder);
      model.trigger('change');
      this.parentView.canvas.renderAll();
      return this.setNextOrder();
    };

    CustomizerCollection.prototype.copyCid = function(model) {
      return model.cid = model.attributes.cid;
    };

    return CustomizerCollection;

  })(Backbone.Collection);

  ModelView = (function(_super) {
    __extends(ModelView, _super);

    function ModelView() {
      _ref2 = ModelView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    ModelView.prototype.className = 'model-warper';

    ModelView.prototype.events = {
      'click .close': 'closeModel',
      'click .pc-prompt-cancel': 'closeModel',
      'click .pc-prompt-ok': 'promptOk'
    };

    ModelView.prototype.render = function(modal) {
      var $el;
      $el = Customizer.templates["view/popup"]({
        modal: modal
      });
      this.$el.html($el).hide(0);
      jQuery('body').append(this.$el);
      this.showModel();
      return $el;
    };

    ModelView.prototype.alert = function(message, title, callback) {
      this.render({
        body: "<p class='pc-model-alert-body'>" + message + "</p>",
        title: title
      });
      this.callback = callback;
      return this;
    };

    ModelView.prototype.prompt = function(message, title, callback) {
      this.render({
        body: "<div class='input-field-container'><label class='pc-model-alert-body'>" + message + "</label><input class='pc-input-field promt-input'></div><div class='pc-prompt-error-message' style='display:none'></div> <div class='pc-model-button-container fb-button-group'><button class='pc-prompt-ok fb-button'>OK</button><button class='pc-prompt-cancel fb-button fb-button-default'>Cancel</button></div>",
        title: title
      });
      this.callback = callback;
      return this;
    };

    ModelView.prototype.promptOk = function() {
      var val;
      val = this.$el.find('.promt-input').val();
      if (val !== void 0 && val !== null && val !== '') {
        this.callback(val);
        return this.closeModel();
      } else {
        return this.$el.find('.pc-prompt-error-message').html("Plesae enter value.").show(500);
      }
    };

    ModelView.prototype.closeModel = function() {
      var _this;
      _this = this;
      this.$el.find('.pc-prompt-error-message').html("").hide(500);
      return this.$el.fadeOut(500, function() {
        return _this.$el.remove();
      });
    };

    ModelView.prototype.showModel = function() {
      return this.$el.fadeIn(500);
    };

    return ModelView;

  })(Backbone.View);

  ViewLayerView = (function(_super) {
    __extends(ViewLayerView, _super);

    function ViewLayerView() {
      _ref3 = ViewLayerView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    ViewLayerView.prototype.className = 'pc-layers-wraper';

    ViewLayerView.prototype.events = {
      'click li': 'focusEditView',
      'click .pc-layers-delete': 'remove',
      'click .pc-layers-lock-unlock': 'lockUnlock'
    };

    ViewLayerView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      return this.canvas = this.parentView.canvas;
    };

    ViewLayerView.prototype.render = function() {
      var $el, layers;
      layers = this.canvas.getObjects();
      $el = Customizer.templates["view/layers"]({
        layers: layers
      });
      this.$el.html($el);
      this.setSortable();
      return this;
    };

    ViewLayerView.prototype.focusEditView = function(ev) {
      var id, obj;
      id = jQuery(ev.currentTarget).data('id');
      obj = this.canvas.getItemByMyID(id);
      this.canvas.setActiveObject(obj);
      return this.canvas.renderAll();
    };

    ViewLayerView.prototype.lockUnlock = function(ev) {
      var $el, id, object;
      if (jQuery(ev.currentTarget).prop("tagName") === 'li') {
        id = jQuery(ev.currentTarget).data('id');
        $el = jQuery(ev.currentTarget);
      } else {
        id = jQuery(ev.currentTarget).closest('li').data('id');
        $el = jQuery(ev.currentTarget).closest('li');
      }
      object = this.canvas.getItemByMyID(id);
      if (object.locked === false) {
        object.set({
          selection: true,
          selectable: false,
          lockScalingX: true,
          lockScalingY: true,
          lockUniScaling: true,
          lockRotation: true,
          lockMovementX: true,
          lockMovementY: true,
          locked: true,
          hasBorders: false,
          hasControls: false,
          hasRotatingPoint: false,
          hoverCursor: 'default',
          isResizable: false,
          isDraggable: false
        });
        $el.find('.fa-unlock-alt').removeClass('fa-unlock-alt').addClass('fa-lock');
      } else {
        object.set({
          selection: false,
          selectable: true,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: false,
          lockRotation: false,
          lockMovementX: false,
          lockMovementY: false,
          locked: false,
          hasBorders: true,
          hasControls: true,
          hasRotatingPoint: true,
          isResizable: true,
          isDraggable: true
        });
        $el.find('.fa-lock').removeClass('fa-lock').addClass('fa-unlock-alt');
      }
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
      return this.parentView.updateModel(id);
    };

    ViewLayerView.prototype.remove = function(ev) {
      var $el, id, obj;
      if (jQuery(ev.currentTarget).prop("tagName") === 'li') {
        id = jQuery(ev.currentTarget).data('id');
        $el = jQuery(ev.currentTarget);
      } else {
        id = jQuery(ev.currentTarget).closest('li').data('id');
        $el = jQuery(ev.currentTarget).closest('li');
      }
      obj = this.canvas.getItemByMyID(id);
      obj.remove();
      $el.remove();
      this.parentView.getModel(id).destroy();
      return this.parentView.handleFormUpdate();
    };

    ViewLayerView.prototype.scrollLayerWrapper = function($layerContainer) {
      var bottom, li;
      if (typeof this.$layerContainer === 'undefined' || this.$layerContainer.length === 0) {
        return;
      }
      li = jQuery(this.$layerContainer).find('li.active');
      if (typeof li === 'undefined' || li.length === 0) {
        return;
      }
      bottom = this.$layerContainer.offset().top + this.$layerContainer.height();
      if ((li.offset().top + li.height()) > bottom) {
        return jQuery(this.$layerContainer).animate({
          scrollTop: li.offset().top
        }, 200);
      }
    };

    ViewLayerView.prototype.setSortable = function() {
      var _this = this;
      this.$layerContainer = this.$el.find('.pc-layers-contianer');
      if (!this.$layerContainer) {
        return;
      }
      if (this.$layerContainer.hasClass('ui-sortable')) {
        this.$layerContainer.sortable('destroy');
      }
      this.scroll = "";
      _this = this;
      return this.$layerContainer.sortable({
        forcePlaceholderSize: true,
        placeholder: 'sortable-placeholder',
        containment: "parent",
        scrollSpeed: 2,
        items: "li:not(.unsortable)",
        start: function(e, ui) {
          return ui.placeholder.height(ui.helper.height());
        },
        stop: function(e, ui) {
          var total;
          total = jQuery(e.target).find('li').length;
          jQuery(e.target).find('li').each(function(index) {
            var i, id, model, object;
            i = total - (index + 1);
            id = jQuery(this).data('id');
            model = _this.parentView.getModel(id);
            object = _this.canvas.getItemByMyID(id);
            object.moveTo(i);
            model.set(Customizer.options.mappings.LAYER_DATA + '.order', i);
            model.set(Customizer.options.mappings.LAYER_DATA + '.zIndex', i);
            model.set('order', i);
            model.trigger('change');
            return _this.parentView.bringToppedElementsToFront();
          });
          return true;
        },
        update: function(e, ui) {
          return jQuery(e.target).find('li').each(function(i) {
            jQuery(this).data('order', i + 1);
            return jQuery(this).attr('data-order', i + 1);
          });
        },
        scroll: true,
        scrollSensitivity: 80,
        scrollSpeed: 3,
        cursor: "move",
        tolerance: "pointer"
      });
    };

    ViewLayerView.prototype.forceRender = function(id) {
      var scrolled_val;
      scrolled_val = this.$el.scrollTop().valueOf();
      return this.render();
    };

    return ViewLayerView;

  })(Backbone.View);

  EditLayerView = (function(_super) {
    __extends(EditLayerView, _super);

    function EditLayerView() {
      _ref4 = EditLayerView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    EditLayerView.prototype.className = 'pc-edit-layer-wraper';

    EditLayerView.prototype.events = {
      'click .align-bottom': 'alignBottom',
      'click .align-top': 'alignTop',
      'click .vertical-align-center': 'verticalCenter',
      'click .align-left': 'alignLeft',
      'click .align-right': 'alignRight',
      'click .hoizontal-align-center': 'horizontalCenter',
      'click .toggle-div': 'toggle',
      'change .text-font-family': 'fontFamily',
      'keydown .text-font-size': 'fontSize',
      'click .text-bold': 'textBold',
      'click .text-italic': 'textItalic',
      'click .text-underline': 'textUnderline',
      'click .rotate-left': 'rotateLeft',
      'click .rotate-right': 'rotateRight',
      'click .reset-layer': 'resetLayer',
      'change .checkbox-removable': 'isRemovable',
      'change .checkbox-draggable': 'isDraggable',
      'change .checkbox-rotatable': 'isRotatable',
      'change .checkbox-unlockable': 'isUnlockable',
      'change .checkbox-resizable': 'isResizable',
      'change .checkbox-hide-layer': 'isHideLayer',
      'change .checkbox-stay-on-top': 'stayOnTop',
      'keyup .pc_allowed_colors': 'allowedColors',
      'keyup .pc_default_color': 'defaultColor',
      'change #enable_bounding': 'boundingEnable',
      'change #another_element_bounding': 'elementBoundingEnable',
      'keyup .input_another_element_bounding_name': 'boundingElementName',
      'keyup .bounding_coords': 'boundingBoxCoords',
      'change .input_bounding_box_mode': 'boundingMode'
    };

    EditLayerView.prototype.initialize = function(options) {
      var _ref5;
      this.parentView = options.parentView;
      this.layer = options.layer;
      this.model = options.layer.model;
      return _ref5 = options.layer, this.canvas = _ref5.canvas, _ref5;
    };

    EditLayerView.prototype.render = function() {
      var $el;
      $el = Customizer.templates["edit/base"]({
        layer: this.layer,
        rf: this.model
      });
      jQuery('body > .colorpicker').remove();
      this.$el.html($el);
      this.setColorPicker();
      this.buindSetting();
      return this;
    };

    EditLayerView.prototype.toggle = function(e) {
      var target, _this;
      _this = this;
      target = jQuery(e.currentTarget).data('target');
      this.parentView.$el.find(target).slideToggle();
      if (jQuery(target).hasClass('tool-tip')) {
        return jQuery('.toggle-div').each(function() {
          if (e.currentTarget !== this) {
            target = jQuery(this).data('target');
            if (jQuery(target).hasClass('tool-tip')) {
              return _this.parentView.$el.find(target).slideUp();
            }
          }
        });
      }
    };

    EditLayerView.prototype.isRemovable = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, 'removable', true);
      } else {
        return this.update_layer_date(obj, 'removable', false);
      }
    };

    EditLayerView.prototype.isUnlockable = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, 'unlockable', true);
      } else {
        return this.update_layer_date(obj, 'unlockable', false);
      }
    };

    EditLayerView.prototype.isHideLayer = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, 'hideLayer', true);
      } else {
        return this.update_layer_date(obj, 'hideLayer', false);
      }
    };

    EditLayerView.prototype.boundingEnable = function(e) {
      var obj, parent;
      obj = this.canvas.getActiveObject();
      parent = jQuery(e.currentTarget).closest('.pc-define-bounding');
      if (jQuery(e.currentTarget).is(':checked')) {
        if (jQuery('.input_another_element_bounding_name').is(':checked')) {
          this.update_layer_date(obj, {
            'boundingEnable': true,
            'elementBoundingEnable': true,
            'boundingElementName': parent.find('[name="another_element_bounding_name"]').val(),
            'boundingMode': parent.find('[name="bounding_box_mode"]').val()
          });
        } else {
          this.update_layer_date(obj, {
            'boundingEnable': true,
            'elementBoundingEnable': false,
            'boundingCoordsLeft': parent.find('[name="bounding_coords_left"]').val(),
            'boundingCoordsTop': parent.find('[name="bounding_coords_top"]').val(),
            'boundingCoordsWidth': parent.find('[name="bounding_coords_width"]').val(),
            'boundingCoordsHeight': parent.find('[name="bounding_coords_height"]').val(),
            'boundingMode': parent.find('[name="bounding_box_mode"]').val()
          });
        }
      } else {
        this.update_layer_date(obj, {
          'boundingEnable': false
        });
      }
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.elementBoundingEnable = function(e) {
      var obj, parent;
      obj = this.canvas.getActiveObject();
      parent = jQuery(e.currentTarget).closest('.pc-define-bounding');
      if (jQuery(e.currentTarget).is(':checked')) {
        this.update_layer_date(obj, {
          'boundingEnable': true,
          'elementBoundingEnable': true,
          'boundingElementName': parent.find('[name="another_element_bounding_name"]').val(),
          'boundingCoordsLeft': "",
          'boundingCoordsTop': "",
          'boundingCoordsWidth': "",
          'boundingCoordsHeight': "",
          'boundingMode': parent.find('[name="bounding_box_mode"]').val()
        });
      } else {
        this.update_layer_date(obj, {
          'boundingEnable': true,
          'elementBoundingEnable': false,
          'boundingElementName': "",
          'boundingCoordsLeft': parent.find('[name="bounding_coords_left"]').val(),
          'boundingCoordsTop': parent.find('[name="bounding_coords_top"]').val(),
          'boundingCoordsWidth': parent.find('[name="bounding_coords_width"]').val(),
          'boundingCoordsHeight': parent.find('[name="bounding_coords_height"]').val(),
          'boundingMode': parent.find('[name="bounding_box_mode"]').val()
        });
      }
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.boundingElementName = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      this.update_layer_date(obj, 'boundingElementName', jQuery(e.currentTarget).val());
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.boundingBoxCoords = function(e) {
      var coord, obj;
      obj = this.canvas.getActiveObject();
      coord = jQuery(e.currentTarget).data('coord');
      this.update_layer_date(obj, "boundingCoords" + coord, jQuery(e.currentTarget).val());
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.boundingMode = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      this.update_layer_date(obj, 'boundingMode', jQuery(e.currentTarget).val());
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.isResizable = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj.locked === true) {
        return;
      }
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, {
          isResizable: true,
          lockScalingX: false,
          lockScalingY: false,
          hasControls: true
        });
      } else {
        return this.update_layer_date(obj, {
          isResizable: false,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false
        });
      }
    };

    EditLayerView.prototype.stayOnTop = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (jQuery(e.currentTarget).is(':checked')) {
        this.update_layer_date(obj, {
          'stayOnTop': true,
          evented: false
        });
      } else {
        this.update_layer_date(obj, {
          'stayOnTop': false,
          evented: true
        });
      }
      this.bringToppedElementsToFront();
      return this.parentView.refreshLayer(obj);
    };

    EditLayerView.prototype.defaultColor = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      return this.update_layer_date(obj, {
        'defaultColor': jQuery(e.currentTarget).val()
      });
    };

    EditLayerView.prototype.allowedColors = function(e) {
      var colors, obj;
      obj = this.canvas.getActiveObject();
      colors = jQuery(e.currentTarget).val();
      colors = colors.split(',');
      colors.map(function(x, y, z) {
        return z[y] = x.trim();
      });
      colors = colors.filter(function(i) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(i);
      });
      console.log(colors);
      return this.update_layer_date(obj, {
        'allowedColors': colors
      });
    };

    EditLayerView.prototype.isDraggable = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj.locked === true) {
        return;
      }
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, {
          isDraggable: true,
          lockMovementX: false,
          lockMovementY: false
        });
      } else {
        return this.update_layer_date(obj, {
          isDraggable: false,
          lockMovementX: true,
          lockMovementY: true
        });
      }
    };

    EditLayerView.prototype.isRotatable = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj.locked === true) {
        return;
      }
      if (jQuery(e.currentTarget).is(':checked')) {
        return this.update_layer_date(obj, {
          'lockRotation': false,
          hasRotatingPoint: true
        });
      } else {
        return this.update_layer_date(obj, {
          'lockRotation': true,
          hasRotatingPoint: false
        });
      }
    };

    EditLayerView.prototype.buindSetting = function() {
      return rivets.bind(this.parentView.$el.find('#admin-setting-container'), {
        model: this.model
      });
    };

    EditLayerView.prototype.setColorPicker = function() {
      var color, colorpicker, filters, _this;
      _this = this;
      if (_this.layer.model.get(Customizer.options.mappings.LAYER_DATA + '.type') === 'text') {
        color = this.layer.model.get(Customizer.options.mappings.LAYER_DATA + '.fill');
      } else {
        filters = this.layer.model.get(Customizer.options.mappings.LAYER_DATA + '.filters');
        if (filters.length > 0) {
          color = filters[0].color;
        } else {
          color = '#000';
        }
      }
      return colorpicker = this.$el.find('.colorselector').ColorPicker({
        color: color,
        onShow: function(colpkr) {
          jQuery(colpkr).fadeIn(500);
          return false;
        },
        onHide: function(colpkr) {
          jQuery(colpkr).fadeOut();
          return false;
        },
        onChange: function(hsb, hex, rgb) {
          jQuery('.colorselector .background-color').css('backgroundColor', "#" + hex);
          if (_this.layer.model.get(Customizer.options.mappings.LAYER_DATA + '.type') === 'text') {
            return _this.update_layer_date(_this.layer, 'fill', "#" + hex);
          } else {
            return _this.applyFilterValue(0, 'color', "#" + hex);
          }
        }
      });
    };

    EditLayerView.prototype.applyFilterValue = function(index, prop, value) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj.filters[index]) {
        obj.filters[index][prop] = value;
      } else {
        obj.filters.push(new fabric.Image.filters.Tint({
          color: value
        }));
      }
      obj.applyFilters(this.canvas.renderAll.bind(this.canvas));
      obj.model.set(Customizer.options.mappings.LAYER_DATA + ".filters", obj.filters);
      return obj.model.trigger('change');
    };

    EditLayerView.prototype.fontFamily = function(e) {
      var font, obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      this.update_layer_date(obj, 'fontFamily', jQuery(e.currentTarget).val());
      font = obj.toJSON().fontSize;
      this.update_layer_date(obj, 'fontSize', parseInt(font) + 1);
      return this.update_layer_date(obj, 'fontSize', font);
    };

    EditLayerView.prototype.fontSize = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      this.update_layer_date(obj, 'fontSize', jQuery(e.currentTarget).val());
      return this.parentView.setBoundry(obj, this.parentView);
    };

    EditLayerView.prototype.textBold = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'fontWeight', obj.getFontWeight() === 'bold' ? 'normal' : 'bold');
    };

    EditLayerView.prototype.textItalic = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'fontStyle', obj.getFontStyle() === 'italic' ? 'normal' : 'italic');
    };

    EditLayerView.prototype.textUnderline = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'textDecoration', obj.getTextDecoration() === 'underline' ? 'none' : 'underline');
    };

    EditLayerView.prototype.rotateLeft = function(e) {
      var angle, obj, resetOrigin;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      resetOrigin = false;
      if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
        obj.setOriginToCenter && obj.setOriginToCenter();
        resetOrigin = true;
      }
      angle = obj.getAngle();
      angle += 5;
      this.update_layer_date(obj, 'angle', angle);
      if (resetOrigin) {
        return obj.setCenterToOrigin && obj.setCenterToOrigin();
      }
    };

    EditLayerView.prototype.rotateRight = function(e) {
      var angle, obj, resetOrigin;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      resetOrigin = false;
      if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
        obj.setOriginToCenter && obj.setOriginToCenter();
        resetOrigin = true;
      }
      angle = obj.getAngle();
      angle -= 5;
      this.update_layer_date(obj, 'angle', angle);
      if (resetOrigin) {
        return obj.setCenterToOrigin && obj.setCenterToOrigin();
      }
    };

    EditLayerView.prototype.alignBottom = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'top', this.canvas.height - obj.getHeight());
    };

    EditLayerView.prototype.alignTop = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'top', 0);
    };

    EditLayerView.prototype.alignLeft = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'left', 0);
    };

    EditLayerView.prototype.alignRight = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'left', this.canvas.width - obj.getWidth());
    };

    EditLayerView.prototype.horizontalCenter = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'left', (this.canvas.width / 2) - (obj.getWidth() / 2));
    };

    EditLayerView.prototype.verticalCenter = function(e) {
      var obj;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      return this.update_layer_date(obj, 'top', (this.canvas.height / 2) - (obj.getHeight() / 2));
    };

    EditLayerView.prototype.center = function(e) {
      var left, obj, top;
      obj = this.canvas.getActiveObject();
      if (obj === void 0) {
        return;
      }
      top = (this.canvas.height / 2) - (obj.getHeight() / 2);
      left = (this.canvas.width / 2) - (obj.getWidth() / 2);
      return this.update_layer_date(obj, {
        top: top,
        left: left
      });
    };

    EditLayerView.prototype.update_layer_date = function(obj, key, value) {
      if (typeof key === 'object') {
        jQuery.each(key, function(k, v) {
          obj.set(k, v);
          return obj.model.set(Customizer.options.mappings.LAYER_DATA + "." + k, v);
        });
      } else {
        obj.set(key, value);
        obj.model.set(Customizer.options.mappings.LAYER_DATA + "." + key, value);
      }
      obj.setCoords();
      this.canvas.renderAll();
      return obj.model.trigger('change');
    };

    EditLayerView.prototype.forceRender = function(id) {
      return this.render();
    };

    return EditLayerView;

  })(Backbone.View);

  CanvasView = (function() {
    function CanvasView() {}

    CanvasView.prototype.initialize = function(options) {
      return this.parentView = options;
    };

    CanvasView.prototype.update_layer = function(obj, options) {
      var order;
      order = options.model.get(Customizer.options.mappings.LAYER_DATA + '.order');
      if (order !== void 0) {
        obj.moveTo(order);
        obj.set('order', order);
      }
      if (obj.getTop() === 0 && obj.getLeft() === 0) {
        obj.center();
      }
      this.parentView.updateModel(obj.model.get('cid'));
      this.parentView.setBoundry(obj, this.parentView);
      this.parentView.randerLayers();
      return this.parentView.refreshLayer(obj);
    };

    CanvasView.prototype.add = function(obj) {
      if (obj.type === void 0) {
        obj.type = obj.template.options.type;
      }
      return this[obj.type](obj);
    };

    CanvasView.prototype.text = function(obj) {
      var defaultOptions, options, template, text;
      template = obj.template;
      options = template.options;
      defaultOptions = {};
      options = jQuery.extend(true, {}, this.getDefault(defaultOptions, obj), options);
      delete options.clipTo;
      if (options.template.text) {
        text = options.template.text;
      } else {
        text = "";
      }
      text = new fabric.IText(text, options);
      obj.canvas.add(text);
      return this.update_layer(text, options);
    };

    CanvasView.prototype.rect = function(obj) {
      var defaultOptions, options, rect, template;
      template = obj.template;
      options = template.options;
      defaultOptions = {};
      options = jQuery.extend(true, {}, this.getDefault(defaultOptions, obj), options);
      delete options.clipTo;
      rect = new fabric.Rect(options);
      obj.canvas.add(rect);
      return this.update_layer(rect, options);
    };

    CanvasView.prototype.image = function(obj) {
      var img, options, template, url, _this;
      _this = this;
      template = obj.template;
      options = template.options;
      if (template.full !== void 0) {
        url = template.full;
      } else if (template.imageDate !== void 0) {
        url = template.imageDate;
      }
      return img = fabric.Image.fromURL(template.full, function(image) {
        var defaultOptions, filters;
        defaultOptions = {
          width: image.width,
          height: image.height
        };
        options = jQuery.extend(true, {}, _this.getDefault(defaultOptions, obj), options);
        delete options.clipTo;
        filters = {};
        if (options.filters !== void 0 && options.filters.length > 0) {
          filters = options.filters;
          delete options.filters;
        }
        image.set(options);
        obj.canvas.add(image);
        if (filters.length > 0) {
          _this.setFilterValue(image, filters);
        }
        return _this.update_layer(image, options);
      });
    };

    CanvasView.prototype.setFilterValue = function(obj, filters) {
      if (filters) {
        jQuery.each(filters, function(index, filter) {
          if (obj.filters[index]) {
            return obj.filters[index] = filter;
          } else {
            return obj.filters.push(new fabric.Image.filters.Tint(filter));
          }
        });
        obj.applyFilters(obj.canvas.renderAll.bind(obj.canvas));
        obj.model.set(Customizer.options.mappings.LAYER_DATA + ".filters", obj.filters);
        return obj.model.trigger('change');
      }
    };

    CanvasView.prototype.getDefault = function(options, obj) {
      var defaultOptions;
      defaultOptions = {
        id: obj.model.cid,
        model: obj.model,
        template: obj.template,
        locked: false,
        removable: true,
        hideLayer: false,
        displayInLayerBar: true,
        boundingEnable: false,
        boundingElementName: "",
        elementBoundingEnable: false,
        boundingCoordsLeft: "",
        boundingCoordsTop: "",
        boundingCoordsWidth: "",
        boundingCoordsHeight: "",
        boundingMode: "inside",
        stayOnTop: false,
        unlockable: true,
        isResizable: true,
        isDraggable: true,
        lockRotation: false
      };
      if (Customizer.options.settings.boundingBoxCoords !== void 0) {
        defaultOptions.boundingEnable = true;
        if (typeof Customizer.options.settings.boundingBoxCoords === 'object') {
          defaultOptions.elementBoundingEnable = true;
          defaultOptions.boundingCoordsLeft = Customizer.options.settings.boundingBoxCoords.x;
          defaultOptions.boundingCoordsTop = Customizer.options.settings.boundingBoxCoords.y;
          defaultOptions.boundingCoordsWidth = Customizer.options.settings.boundingBoxCoords.width;
          defaultOptions.boundingCoordsHeight = Customizer.options.settings.boundingBoxCoords.height;
        } else {
          defaultOptions.elementBoundingEnable = false;
          defaultOptions.boundingElementName = Customizer.options.settings.boundingBoxCoords;
        }
      }
      if (Customizer.options.settings.administration === true) {
        defaultOptions.administration = true;
      } else {
        defaultOptions.administration = false;
      }
      return jQuery.extend(true, {}, defaultOptions, options);
    };

    return CanvasView;

  })();

  CustomizerView = (function(_super) {
    var _clipById;

    __extends(CustomizerView, _super);

    function CustomizerView() {
      _ref5 = CustomizerView.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    CustomizerView.prototype.SUBVIEWS = [];

    CustomizerView.prototype.canvasView = new CanvasView();

    CustomizerView.prototype.events = {
      'click .js-save-data': 'saveForm',
      'click .fb-tabs a': 'showTab',
      'click .fb-add-field-types a': 'addField',
      'click #pc-text-panel .add-text': 'addTextLayer',
      'change #pc-upload-image-panel .pc-upload-image': 'uploadImages',
      'click .canvas-actions .fullscreen': 'fullscreen',
      'click .canvas-actions .download': 'savePDF',
      'click .canvas-actions .zoom-in': function(e) {
        return this.canvas.setZoom(this.canvas.getZoom() * 1.1);
      },
      'click .canvas-actions .zoom-out': function(e) {
        return this.canvas.setZoom(this.canvas.getZoom() / 1.1);
      },
      'click .canvas-actions .zoom-reset': function(e) {
        return this.canvas.setZoom(1);
      },
      'click .canvas-actions .preview': 'saveImage'
    };

    CustomizerView.prototype.destroy = function() {
      /*@canvas.clear()
      
      _.invoke(@collection.toArray(), 'destroy');
      
      @$el.html("")
      
      
      $html = @$el[0].outerHTML;
      @$el.replaceWith($html);
      */

    };

    CustomizerView.prototype.initialize = function(options) {
      var defaultSettings, selector, settings;
      selector = options.selector, this.customizer = options.customizer, this.bootstrapData = options.bootstrapData, settings = options.settings;
      if (selector != null) {
        this.setElement(jQuery(selector));
      }
      defaultSettings = {
        administration: true,
        boundingBoxColor: '#005ede',
        boundingBoxCoords: ''
      };
      this.canvasView.initialize(this);
      this.settings = jQuery.extend(true, {}, defaultSettings, settings);
      if (this.settings != null) {
        Customizer.options.settings = this.settings;
      }
      if (this.settings.images !== void 0) {
        if (typeof this.settings.images === 'object' || typeof this.settings.images === 'array') {
          jQuery.each(this.settings.images, function(index, v) {
            if (v !== void 0) {
              if (typeof v === 'object' || typeof v === 'array') {
                return jQuery.each(v, function(i, value) {
                  value.type = value.type === void 0 ? index : value.type;
                  value.id = value.id === void 0 ? i : value.id;
                  return Customizer.registerImages(index, value);
                });
              }
            }
          });
        }
      }
      if (this.settings.fonts !== void 0) {
        jQuery.each(this.settings.fonts, function(index, v) {
          return Customizer.registerFonts(v);
        });
      }
      Customizer.registerText();
      Customizer.registerImage();
      this.collection = new CustomizerCollection({
        parentView: this
      });
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.reset, this);
      this.collection.bind('change', this.handleFormUpdate, this);
      this.render();
      this.renderFontsCSS();
      this.bindSaveEvent();
      this.canvas.parentView = this;
      this.listenTo(this.canvas, "mouse:up", function(o) {
        return this.isDown = false;
      });
      this.listenTo(this.canvas, "mouse:down", function(o) {
        return this.isDown = true;
      });
      this.listenTo(this.canvas, "object:moving", this.objectMoveing);
      this.listenTo(this.canvas, "object:selected", this.objectSelected);
      this.listenTo(this.canvas, "object:modified", this.objectModified);
      this.listenTo(this.canvas, "object:scaling", this.objectScaling);
      this.listenTo(this.canvas, "before:selection:cleared", this.beforeSelectionCleared);
      this.listenTo(this.canvas, "after:render", function(evt) {
        return this.calcOffset();
      });
      return this.collection.reset(this.bootstrapData);
    };

    CustomizerView.prototype.fullscreen = function(ev) {
      var $el, offset;
      if (jQuery(ev.currentTarget).prop("tagName") === 'span') {
        $el = jQuery(ev.currentTarget);
      } else {
        $el = jQuery(ev.currentTarget).find('span');
      }
      $el.toggleClass('mif-shrink mif-enlarge');
      this.$el.toggleClass('fullscreen');
      if (this.$el.hasClass('fullscreen')) {
        this.oldCanvasHeight = this.canvas.getHeight();
        this.oldCanvasWidth = this.canvas.getWidth();
        offset = this.$el.find('.canvas-actions').outerHeight(true);
        this.canvas.setHeight(this.$el.height() - offset - 8);
        return this.canvas.setWidth(this.$el.find('.pc-canvas').width());
      } else {
        this.canvas.setHeight(this.oldCanvasHeight);
        return this.canvas.setWidth(this.oldCanvasWidth);
      }
    };

    CustomizerView.prototype.realWidth = function(obj) {
      var clone, width;
      clone = obj.clone();
      clone.css("visibility", "hidden");
      jQuery('body').append(clone);
      width = clone.outerWidth();
      clone.remove();
      return width;
    };

    CustomizerView.prototype.render = function() {
      var canvas, defaultCanvasArgs, el, subview, _i, _len, _ref6;
      this.$el.html(Customizer.templates['page']());
      this.loader = this.$el.find('.pc-loader-container');
      this.loader.show();
      _ref6 = this.SUBVIEWS;
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        subview = _ref6[_i];
        new subview({
          parentView: this
        }).render();
      }
      el = jQuery('<canvas/>');
      this.$el.find('.pc-canvas').html(el);
      defaultCanvasArgs = {
        selection: false,
        hoverCursor: 'pointer',
        controlsAboveOverlay: true,
        centeredScaling: true,
        preserveObjectStacking: true
      };
      if (Customizer.options.settings.canvas === void 0) {
        Customizer.options.settings.canvas = {};
      }
      this.canvasAttr = jQuery.extend(true, {}, Customizer.options.settings.canvas, defaultCanvasArgs);
      canvas = new fabric.Canvas(el[0], this.canvasAttr);
      this.canvas = canvas;
      this.reSetCanvasSize();
      this.randerLayers();
      this.randerUploadedImages();
      this.loader.hide();
      return this;
    };

    CustomizerView.prototype.reSetCanvasSize = function() {
      var h, w;
      h = this.$el.find('.pc-canvas').height();
      w = this.$el.find('.pc-canvas').width();
      if (this.canvasAttr.height !== void 0 && this.canvasAttr.height > 0) {
        this.canvas.setHeight(this.canvasAttr.height);
      } else {
        this.canvas.setHeight(500);
      }
      if (this.canvasAttr.width !== void 0 && this.canvasAttr.width > 0) {
        return this.canvas.setWidth(this.canvasAttr.width);
      } else {
        return this.canvas.setWidth(w);
      }
    };

    CustomizerView.prototype.randerLayers = function(canvas) {
      var $el, layers, layersView;
      layers = this.canvas.getObjects();
      layersView = new ViewLayerView({
        parentView: this,
        canvas: this.canvas
      });
      $el = layersView.render().$el;
      return this.$el.find('#pc-layers').html($el);
    };

    CustomizerView.prototype.renderFontsCSS = function() {
      var $el;
      this.settings.fonts;
      $el = Customizer.templates["partials/text-fonts-css"]();
      return this.$el.prepend($el);
    };

    CustomizerView.prototype.saveImage = function() {
      return window.open(this.exportCanvas().toDataURL(), "Preview", "width=" + (this.canvas.getWidth()) + ", height=" + (this.canvas.getWidth()));
    };

    CustomizerView.prototype.getImageData = function() {
      return this.exportCanvas().toDataURL();
    };

    CustomizerView.prototype.exportCanvas = function() {
      return this.canvas;
      /*newCanvas.setWidth @canvas.getWidth()
      newCanvas.setHeight @canvas.getHeight()
      
      if objects.length > 0
        jQuery.each(objects, (index, vlaue)-> 
          perams = vlaue.toJSON(Customizer.options.jsonArgs)
          if !(perams.dontSync == true)
              newCanvas.add(vlaue)
        )
      newCanvas
      */

    };

    CustomizerView.prototype.savePDF = function() {
      var $oldColor, doc, e, finename, height, heightLeft, imgData, imgHeight, imgWidth, pageHeight, position, width;
      try {
        width = this.canvas.getWidth();
        height = this.canvas.getHeight();
        $oldColor = this.canvas.backgroundColor;
        this.canvas.backgroundColor = '#fff';
        imgData = this.exportCanvas().toDataURL({
          format: 'jpeg'
        });
        this.canvas.backgroundColor = $oldColor;
        this.canvas.renderAll();
        imgWidth = 210;
        pageHeight = 295;
        imgHeight = height * imgWidth / width;
        heightLeft = imgHeight;
        doc = new jsPDF('p', 'mm');
        position = 0;
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        finename = prompt('Please enter file name', 'Product');
        return doc.save(finename + '.pdf');
      } catch (_error) {
        e = _error;
        return alert("Error description: " + e.message);
      }
    };

    CustomizerView.prototype.clearSelection = function(evt) {};

    CustomizerView.prototype.objectSelected = function(evt) {
      var $el, layersEditView, view;
      view = evt.target.canvas.parentView;
      view.setLayersActive(evt.target);
      layersEditView = new EditLayerView({
        parentView: view,
        layer: evt.target
      });
      $el = layersEditView.render().$el;
      return view.$el.find('#pc-edit-layer').html($el);
    };

    CustomizerView.prototype.beforeSelectionCleared = function(evt) {
      var view;
      if (evt === void 0 || evt.target === void 0 || evt.target === null) {

      } else {
        view = evt.target.canvas.parentView;
        if (view !== void 0) {
          return view.$el.find('#pc-edit-layer').html("");
        }
      }
    };

    CustomizerView.prototype.objectModified = function(evt) {
      var view;
      view = evt.target.canvas.parentView;
      return view.updateModel(evt.target.id);
    };

    CustomizerView.prototype.objectScaling = function(evt) {
      var obj, view;
      view = evt.target.canvas.parentView;
      obj = evt.target;
      return view.setBoundry(obj, view);
    };

    CustomizerView.prototype.objectMoveing = function(evt) {
      var obj, view;
      view = evt.target.canvas.parentView;
      obj = evt.target;
      return view.setBoundry(obj, view);
    };

    CustomizerView.prototype.setBoundry = function(object, view) {
      var boundRect, boundingBox, h, w;
      if (view !== void 0) {
        view = this;
      }
      boundingBox = view.getBoundingBoxCoords(object);
      if (!boundingBox) {
        boundingBox = object.canvas;
      }
      boundRect = object.getBoundingRect();
      if (object.getHeight() > boundingBox.height) {
        h = Math.min(object.getHeight(), boundingBox.height);
        object.scaleToHeight(h);
        object.setCoords();
        boundRect = object.getBoundingRect();
      }
      if (object.getWidth() > boundingBox.width) {
        w = Math.min(object.getWidth(), boundingBox.width);
        object.scaleToWidth(w);
        object.setCoords();
        boundRect = object.getBoundingRect();
      }
      object.setCoords();
      if (boundRect.top < boundingBox.top) {
        object.top = Math.max(object.top, boundingBox.top);
      }
      if (boundRect.left < boundingBox.left) {
        object.left = Math.max(object.left, boundingBox.left);
      }
      if ((boundRect.top + boundRect.height) > (boundingBox.top + boundingBox.height)) {
        object.top = Math.min(object.top, boundingBox.height - boundRect.height + boundingBox.top);
      }
      if ((boundRect.left + boundRect.width) > (boundingBox.left + boundingBox.width)) {
        object.left = Math.min(object.left, boundingBox.width - boundRect.width + boundingBox.left);
      }
      return view.updateModel(object.id);
    };

    /*getBoundingBoxCoords : (obj, _this)->
      if(_this == undefined)
        _this = @
      if(obj == undefined)
        obj = @canvas.getActiveObject()
    
      elemParams = obj.toJSON(Customizer.options.jsonArgs)
    
      if elemParams.boundingEnable
        bbCoords = _this._getBoundingBoxCoords(obj, _this)
        if bbCoords
          currentBoundingObject = new (fabric.Rect)(
            left: bbCoords.left
            top: bbCoords.top
            width: bbCoords.width
            height: bbCoords.height
            stroke: Customizer.options.settings.boundingBoxColor
            strokeWidth: 1
            fill: false
            selectable: false
            evented: false
            originX: 'left'
            originY: 'top'
            name: 'bounding-box'
            params:
              x: bbCoords.left
              y: bbCoords.top
              scale: 1)
          _this.canvas.add currentBoundingObject
          currentBoundingObject.bringToFront()
    */


    CustomizerView.prototype.getBoundingBoxCoords = function(element) {
      var bbRect, boundingEnable, i, name, object, objects, params;
      params = element.toJSON(Customizer.options.jsonArgs);
      if (params.boundingMode === 'clipping') {
        element.set('clipName', params.boundingElementName);
        return this.setCliping(element);
      } else {
        if (params.boundingEnable) {
          boundingEnable = void 0;
          if (typeof params.boundingElement === 'object') {
            return {
              left: params.boundingCoordsTop,
              top: params.boundingCoordsLeft,
              width: params.boundingCoordsWidth,
              height: params.boundingCoordsHeight
            };
          } else {
            objects = element.canvas.getObjects();
            i = 0;
            while (i < objects.length) {
              object = objects[i];
              name = object.title === void 0 ? object.id : object.title;
              if (params.boundingElementName === name) {
                bbRect = object.getBoundingRect();
                return {
                  left: bbRect.left,
                  top: bbRect.top,
                  width: bbRect.width,
                  height: bbRect.height
                };
                break;
              }
              ++i;
            }
          }
        }
        return false;
      }
    };

    CustomizerView.prototype.setCliping = function(obj) {
      return obj.clipTo = function(ctx) {
        return _.bind(clipByName, this)(ctx);
      };
    };

    CustomizerView.prototype.removeCliping = function(obj) {
      return delete obj.clipTo;
    };

    CustomizerView.prototype.bindSaveEvent = function() {
      var _this = this;
      this.formSaved = true;
      this.saveFormButton = this.$el.find(".js-save-data");
      this.saveFormButton.attr('disabled', true).text(Customizer.options.dict.ALL_CHANGES_SAVED);
      if (!!Customizer.options.AUTOSAVE) {
        setInterval(function() {
          return _this.saveForm.call(_this);
        }, 5000);
      }
      return jQuery(window).bind('beforeunload', function() {
        if (_this.formSaved) {
          return void 0;
        } else {
          return Customizer.options.dict.UNSAVED_CHANGES;
        }
      });
    };

    CustomizerView.prototype.reset = function() {
      return this.addAll();
    };

    CustomizerView.prototype.setLayersActive = function(obj) {
      var li;
      if (this.$el.find('#pc-layers ul > li')) {
        li = this.$el.find('#pc-layers ul > li').filter(function(i, li) {
          return jQuery(li).data('id') === obj.id;
        });
      }
      if (li.length === 0) {
        return this.randerLayers();
      } else {
        if (!li.hasClass('active')) {
          this.$el.find('#pc-layers ul > li').removeClass('active');
          return li.addClass('active');
        }
      }
    };

    CustomizerView.prototype.updateModel = function(id) {
      var data, model, obj;
      obj = this.canvas.getItemByMyID(id);
      model = this.getModel(id);
      data = obj.toJSON(Customizer.options.jsonArgs);
      jQuery.each(data, function(index, vlaue) {
        return model.set(Customizer.options.mappings.LAYER_DATA + '.' + index, vlaue);
      });
      if (model.get('type') === 'text') {
        model.set('text', obj.__text);
      }
      return model.trigger('change');
    };

    CustomizerView.prototype.refreshLayer = function(obj) {
      this.bringToppedElementsToFront();
      if (obj !== void 0) {
        obj.setCoords();
      }
      return this.canvas.renderAll();
    };

    CustomizerView.prototype._clipElement = function(element, _this) {
      var bbCoords;
      bbCoords = this.getBoundingBoxCoords(element);
      if (bbCoords) {
        element.clippingRect = bbCoords;
        element.setClipTo(function(ctx) {
          _this._clipById(ctx, this);
        });
      }
    };

    _clipById = function(ctx, _this, scale) {
      var clipRect, scaleXTo1, scaleYTo1;
      scale = scale === void 0 ? 1 : scale;
      clipRect = _this.clippingRect;
      scaleXTo1 = 1 / _this.scaleX;
      scaleYTo1 = 1 / _this.scaleY;
      ctx.save();
      ctx.translate(0, 0);
      ctx.rotate(fabric.util.degreesToRadians(_this.angle * -1));
      ctx.scale(scaleXTo1, scaleYTo1);
      ctx.beginPath();
      ctx.rect(clipRect.left * responsiveScale - _this.left - (_this.originX === 'left' ? _this.width * .5 * responsiveScale : 0), clipRect.top * responsiveScale - _this.top - (_this.originY === 'top' ? _this.height * .5 * responsiveScale : 0), clipRect.width * responsiveScale * scale, clipRect.height * responsiveScale * scale);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    };

    CustomizerView.prototype.bringToppedElementsToFront = function() {
      var bringToFrontObj, i, object, objects;
      objects = this.canvas.getObjects();
      bringToFrontObj = [];
      this.canvas.renderAll();
      i = 0;
      while (i < objects.length) {
        object = objects[i];
        if (object.model && object.model.get(Customizer.options.mappings.LAYER_DATA + ".stayOnTop") === true) {
          bringToFrontObj.push(object);
        }
        ++i;
      }
      i = 0;
      while (i < bringToFrontObj.length) {
        bringToFrontObj[i].bringToFront();
        ++i;
      }
    };

    CustomizerView.prototype.renderOnFontLoaded = function(fontName) {
      var _this;
      _this = this;
      return WebFont.load({
        custom: {
          families: [fontName]
        },
        fontactive: function(familyName, fvd) {
          jQuery('body').mouseup();
          return _this.canvas.renderAll();
        }
      });
    };

    CustomizerView.prototype.getModel = function(id) {
      return this.collection.find(function(model) {
        return model.cid === id;
      });
    };

    CustomizerView.prototype.showTab = function(e) {
      var $el, target;
      $el = jQuery(e.currentTarget);
      target = $el.data('target');
      $el.closest('li').addClass('active').siblings('li').removeClass('active');
      return jQuery(target).addClass('active').siblings('.fb-tab-pane').removeClass('active');
    };

    CustomizerView.prototype.addOne = function(model, _, options) {
      var model_option, newTemplate, template;
      if (model.attributes[Customizer.options.mappings.LAYER_DATA] !== void 0) {
        model.attributes.cid = model.cid;
        model.attributes[Customizer.options.mappings.LAYER_DATA].id = model.cid;
        model_option = model.get(Customizer.options.mappings.LAYER_DATA);
        model_option.object = model.get('object');
        model_option.name = model.get('name');
        model_option.type = model.get('type');
        if (model.get('title')) {
          model_option.title = model.get('title');
          model_option.clipFor = model.get('title');
        }
      } else {
        model_option = {};
      }
      if (model.get(Customizer.options.mappings.OBJECT) === 'text') {
        template = Customizer.text;
        model_option.text = model.get('text');
      } else if (model.get(Customizer.options.mappings.OBJECT) === 'image') {
        template = Customizer.image;
        template.full = model.get('full');
        if (model.get('title')) {
          template.title = model.get('title');
          template.clipFor = model.get('title');
        }
      } else {
        template = {};
        template.object = model_option.object;
        template.type = model_option.type;
        template.title = model_option.title;
        template.clipFor = model_option.title;
        if (model.get('options') !== void 0) {
          template.options = jQuery.extend(true, {}, template.options, model.get('options'));
        } else {
          template.options = model_option;
        }
      }
      newTemplate = jQuery.extend(true, {}, template);
      if (newTemplate.options === void 0 || newTemplate.options === null) {
        newTemplate.options = {};
      }
      newTemplate.options = jQuery.extend(true, {}, newTemplate.options, model_option);
      return this.canvasView.add({
        type: newTemplate.object,
        template: newTemplate,
        model: model,
        canvas: this.canvas
      });
    };

    CustomizerView.prototype.addAll = function() {
      return this.collection.each(this.addOne, this);
    };

    CustomizerView.prototype.addField = function(e) {
      var attrs, id, type, _this;
      _this = this;
      id = jQuery(e.currentTarget).data('field-id');
      type = jQuery(e.currentTarget).data('field-type');
      attrs = jQuery.extend(true, {}, Customizer.images[type][id]);
      return _this.addImageLayer(attrs);
    };

    CustomizerView.prototype.createField = function(attrs, options) {
      var rf;
      if (Customizer.options.settings.administration === true) {
        attrs.administration = true;
      } else {
        attrs.administration = false;
      }
      rf = this.collection.create(attrs, options);
      this.handleFormUpdate();
      return rf;
    };

    CustomizerView.prototype.removeLayer = function(obj) {
      if (typeof obj !== 'object') {
        obj = this.canvas.getItemByMyID(obj);
      }
      obj.remove();
      this.randerLayers();
      this.canvas.renderAll();
      this.getModel(obj.id).destroy();
      return this.handleFormUpdate();
    };

    CustomizerView.prototype.updateLayer = function(obj, key, value) {
      if (typeof obj !== 'object') {
        obj = this.canvas.getItemByMyID(obj);
      }
      if (typeof key === 'object') {
        jQuery.each(key, function(k, v) {
          obj.set(k, v);
          return obj.model.set(Customizer.options.mappings.LAYER_DATA + "." + k, v);
        });
      } else {
        obj.set(key, value);
        obj.model.set(Customizer.options.mappings.LAYER_DATA + "." + key, value);
      }
      obj.setCoords();
      this.canvas.renderAll();
      return obj.model.trigger('change');
    };

    CustomizerView.prototype.setDraggable = function() {
      /*$draggable = @$el.find(".draggable")
      $draggable.draggable(
        handle: ".handle" 
        containment: '.customizer-main'
      )
      */

    };

    CustomizerView.prototype.addTextLayer = function(e) {
      var attrs, text;
      text = jQuery(e.currentTarget).closest('.fb-text-field-wrapper').find('.pc-text');
      attrs = {
        text: text.val()
      };
      text = text.val("");
      return this.createField(Customizer.helpers.defaultLayersAttrs('text', 'text', attrs));
    };

    CustomizerView.prototype.addImageLayer = function(data) {
      var model, _addImageLayer, _this;
      _this = this;
      _addImageLayer = function(value) {
        var newData;
        newData = jQuery.extend(true, {}, data);
        if (newData.url && newData.full === void 0) {
          newData.full = newData.url;
        }
        if (newData.id !== void 0) {
          delete newData.id;
        }
        if (value !== void 0) {
          newData.title = value;
        }
        return _this.createField(Customizer.helpers.defaultLayersAttrs('img', 'image', newData));
      };
      if (Customizer.options.settings.administration) {
        return model = new ModelView().prompt('Please enter name.', 'Name', function(value) {
          return _addImageLayer(value);
        });
      } else {
        return _addImageLayer();
      }
    };

    CustomizerView.prototype.uploadImages = function(evt) {
      return this.ajax_upload_image(evt.target.files);
    };

    CustomizerView.prototype.randerUploadedImages = function() {
      var uploadImages, _this;
      uploadImages = sessionStorage.getItem('uploadImages');
      if (uploadImages === void 0 || uploadImages === null) {
        uploadImages = {};
      } else {
        uploadImages = JSON.parse(uploadImages);
      }
      _this = this;
      _this.LastUploadImageId = 0;
      if (uploadImages === void 0 || uploadImages === null || uploadImages === "") {
        return uploadImages = {};
      } else {
        return jQuery.each(uploadImages, function(id, data) {
          _this.LastUploadImageId = data.id;
          if (data) {
            return _this.randerUploadedImage(data, data.id);
          }
        });
      }
    };

    CustomizerView.prototype.randerUploadedImage = function(data, id) {
      var $ul, del, li, next_id, session_data, span, _this;
      _this = this;
      $ul = this.$el.find('.uploaded-image-container ul');
      session_data = {};
      if (id === void 0) {
        id = _this.LastUploadImageId;
        id = parseInt(id) > 0 ? parseInt(id) : 0;
        next_id = id + 1;
        _this.LastUploadImageId = next_id;
      } else {
        id = parseInt(id) > 0 ? parseInt(id) : 1;
        next_id = id;
      }
      session_data.id = next_id;
      session_data.url = data.url;
      session_data.moved = data.moved === 'true' ? 'true' : 'false';
      session_data.path = data.path;
      del = jQuery('<span class="delete-contianer"><span class="mif-bin"></span></span>').on('click', function() {
        var li;
        li = jQuery(this).closest('li');
        data = jQuery(li).data('image-data');
        if (data.moved !== 'true') {
          _this.ajax_remove_image(data);
        }
        _this.updateSession(null, data.id);
        _this.customizer.trigger('remove-uploaded-image', _this, li);
        return li.remove();
      });
      span = jQuery("<span class='image-contianer'><img class='thumb' src='" + data.url + "'/></span>").on('click', function() {
        var li;
        li = jQuery(this).closest('li');
        data = jQuery(li).data('image-data');
        return _this.add_uploaded_image(data, li);
      });
      li = jQuery("<li data-id='" + next_id + "' data-type='dataImage'></li>").data('image-data', session_data).append(span).append(del);
      $ul.prepend(li);
      _this.customizer.trigger('image-upload', _this, data, li);
      _this.updateSession(session_data, session_data.id);
      if (_this.LastUploadImageId < session_data.id) {
        return _this.LastUploadImageId = session_data.id;
      }
    };

    CustomizerView.prototype.updateSession = function(data, id) {
      var uploadImages;
      uploadImages = sessionStorage.getItem('uploadImages');
      if (uploadImages === void 0 || uploadImages === null) {
        uploadImages = {};
      } else {
        uploadImages = JSON.parse(uploadImages);
      }
      if (uploadImages[id] !== void 0 && data === null) {
        delete uploadImages[id];
      } else {
        uploadImages[id] = data;
      }
      return sessionStorage.setItem('uploadImages', JSON.stringify(uploadImages));
    };

    CustomizerView.prototype.ajax_upload_image = function(files) {
      var formData, _this;
      formData = new FormData(jQuery('<form></from>')[0]);
      formData.append('image', files[0]);
      formData.append('action', 'pc_upload_image');
      _this = this;
      return jQuery.ajax({
        url: this.settings.imageUploadUrl,
        type: "post",
        data: formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        cache: false,
        beforeSend: function() {
          return _this.loader.show();
        },
        success: function(data) {
          var attrs, image_url;
          if (data.status === 'success') {
            image_url = data.url;
            if (image_url !== void 0 && image_url !== null) {
              attrs = {
                uploadedImage: image_url
              };
            } else if (image_temp_url !== void 0 && image_temp_url !== null) {
              attrs = {
                uploadedImage: image_url
              };
            } else {
              return;
            }
            _this.randerUploadedImage(data);
            return _this.loader.hide();
          } else {
            return _this.loader.hide();
          }
        },
        error: function() {
          return _this.loader.hide();
        }
      });
    };

    CustomizerView.prototype.ajax_remove_image = function(file) {
      var _this;
      _this = this;
      return jQuery.ajax({
        url: this.settings.imageUploadUrl,
        type: "post",
        data: {
          action: 'pc_remove_uploaded_image',
          file: file
        },
        dataType: 'json',
        beforeSend: function() {
          return _this.loader.show();
        },
        success: function(data) {
          return _this.loader.hide();
        },
        error: function() {
          return _this.loader.hide();
        }
      });
    };

    CustomizerView.prototype.add_uploaded_image = function(file, li) {
      var _this;
      _this = this;
      if (file.moved === 'true') {
        _this.addImageLayer({
          full: file.url
        });
        return;
      }
      return jQuery.ajax({
        url: this.settings.imageUploadUrl,
        type: "post",
        data: {
          action: 'pc_added_uploaded_image',
          file: file
        },
        dataType: 'json',
        beforeSend: function() {
          return _this.loader.show();
        },
        success: function(data) {
          var old_data;
          if (data.status === 'success') {
            if (li !== void 0) {
              old_data = li.data('image-data');
              data.id = old_data.id;
              data.moved = 'true';
              _this.updateSession(data, old_data.id);
              li.data('image-data', data);
              _this.addImageLayer({
                full: data.url
              });
            }
            return _this.loader.hide();
          } else {
            return _this.loader.hide();
          }
        },
        error: function() {
          return _this.loader.hide();
        }
      });
    };

    CustomizerView.prototype.handleFormUpdate = function() {
      if (this.updatingBatch) {
        return;
      }
      this.formSaved = false;
      if (this.saveFormButton !== void 0) {
        return this.saveFormButton.removeAttr('disabled').text(Customizer.options.dict.SAVE_FORM);
      } else {

      }
    };

    CustomizerView.prototype.saveForm = function(e) {
      var fields, newFields, payload;
      if (this.formSaved) {
        return;
      }
      this.formSaved = true;
      if (this.saveFormButton !== void 0) {
        this.saveFormButton.attr('disabled', true).text(Customizer.options.dict.ALL_CHANGES_SAVED);
      }
      this.collection.sort();
      fields = this.collection.toJSON();
      newFields = [];
      if (fields.length > 0) {
        jQuery.each(fields, function(index, vlaue) {
          if (!((vlaue.dontSync === true) || (vlaue.layer_data.dontSync === true))) {
            return newFields.push(vlaue);
          }
        });
      }
      payload = JSON.stringify({
        fields: newFields
      });
      if (Customizer.options.HTTP_ENDPOINT) {
        this.doAjaxSave(payload);
      }
      return this.customizer.trigger('save', payload);
    };

    CustomizerView.prototype.doAjaxSave = function(payload) {
      var _this = this;
      return jQuery.ajax({
        url: Customizer.options.HTTP_ENDPOINT,
        type: Customizer.options.HTTP_METHOD,
        data: payload,
        contentType: "application/json",
        success: function(data) {
          var datum, _i, _len, _ref6;
          _this.updatingBatch = true;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            datum = data[_i];
            if ((_ref6 = _this.collection.get(datum.cid)) != null) {
              _ref6.set({
                id: datum.id
              });
            }
            _this.collection.trigger('sync');
          }
          return _this.updatingBatch = void 0;
        }
      });
    };

    return CustomizerView;

  })(Backbone.View);

  Customizer = (function() {
    Customizer.helpers = {
      defaultLayersAttrs: function(type, name, extra_attrs) {
        var attrs, layer;
        attrs = {};
        attrs[Customizer.options.mappings.TYPE] = type;
        attrs[Customizer.options.mappings.DATA_ID] = name;
        attrs.layer_data = {};
        if (extra_attrs !== void 0) {
          attrs = _.extend(attrs, extra_attrs);
        }
        layer = {};
        if (type === 'text') {
          layer = Customizer.text;
        } else if (type === 'img') {
          layer = Customizer.image;
        }
        attrs.object = layer.object !== void 0 ? layer.object : '';
        return (typeof layer.defaultAttributes === "function" ? layer.defaultAttributes(attrs) : void 0) || attrs;
      }
    };

    Customizer.options = {
      BUTTON_CLASS: 'fb-button',
      HTTP_ENDPOINT: '',
      HTTP_METHOD: 'POST',
      AUTOSAVE: true,
      CLEAR_FIELD_CONFIRM: false,
      jsonArgs: ['id', 'unlockable', 'removable', 'hideLayer', 'displayInLayerBar', 'order', 'selection', 'selectable', 'locked', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockUniScaling', 'hasBorders', 'hasControls', 'hasRotatingPoint', 'hoverCursor', 'isResizable', 'isDraggable', 'boundingEnable', 'boundingElementName', 'boundingMode', 'stayOnTop', 'title', 'elementBoundingEnable', 'boundingCoordsLeft', 'boundingCoordsTop', 'boundingCoordsWidth', 'boundingCoordsHeight', 'clipFor', 'clipName', 'evented', 'dontSync', 'defaultColor', 'allowedColors', 'object', 'administration'],
      mappings: {
        DATA_ID: 'data_id',
        TYPE: 'type',
        NAME: 'name',
        OBJECT: 'object',
        LAYER: 'layer',
        LAYER_DATA: 'layer_data',
        ORDER: 'order'
      },
      dict: {
        ALL_CHANGES_SAVED: 'All changes saved',
        SAVE_FORM: 'Save changes',
        UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'
      }
    };

    Customizer.layers = [];

    Customizer.backgrounds = {};

    Customizer.cliparts = {};

    Customizer.text = {};

    Customizer.images = {};

    Customizer.fonts = {};

    Customizer.fields = {};

    Customizer.image = {};

    Customizer.inputFields = {};

    Customizer.nonInputFields = {};

    Customizer.addLayers = function(opts) {
      return Customizer.layers.push(opts);
    };

    Customizer.registerField = function(name, opts) {
      var x, _i, _len, _ref6;
      _ref6 = ['view', 'edit'];
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        x = _ref6[_i];
        opts[x] = _.template(opts[x]);
      }
      return Customizer.fields[name] = opts;
    };

    Customizer.registerImages = function(category, opts) {
      var id;
      if (opts.type === void 0) {
        opts.type = category;
      }
      if (opts.object === void 0) {
        opts.object = 'image';
      }
      if (opts.id !== void 0) {
        id = opts.id;
      }
      if (opts.title === void 0 && opts.name !== void 0) {
        opts.title = opts.name;
      }
      if (Customizer.images[category] === void 0) {
        Customizer.images[category] = {};
      }
      return Customizer.images[category][id] = opts;
    };

    Customizer.registerFonts = function(font) {
      var ext, filename;
      if (font.name === void 0) {
        filename = font.url.split('/').pop().split('#')[0].split('?')[0];
        font.name = filename.split('.')[0];
        font.name = font.name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
      } else {
        font.name = font.name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
      }
      if (font.displayName === void 0) {
        font.displayName = font.name;
      }
      if (font.src === void 0) {
        font.src = {};
      }
      if (font.url !== void 0) {
        filename = font.url.split('/').pop().split('#')[0].split('?')[0];
        ext = filename.split('.')[1];
        if (ext !== void 0) {
          font.src[ext] = font.url;
        }
      }
      return Customizer.fonts[font.name] = font;
    };

    Customizer.registerShape = function() {
      var opts;
      opts = {
        type: 'text',
        object: 'text'
      };
      return Customizer.shape = opts;
    };

    Customizer.registerText = function() {
      var opts;
      opts = {
        type: 'text',
        object: 'text'
      };
      return Customizer.text = opts;
    };

    Customizer.registerImage = function() {
      var opts;
      opts = {
        type: 'image',
        object: 'image'
      };
      return Customizer.image = opts;
    };

    Customizer.registerClipArts = function(name, opts) {
      if (opts.type === void 0) {
        opts.type = name;
      }
      if (opts.object === void 0) {
        opts.object = 'image';
      }
      return Customizer.cliparts[name] = opts;
    };

    Customizer.prototype.setSettings = function(key, value) {
      return Customizer.options.settings[key] = value;
    };

    function Customizer(opts) {
      if (opts == null) {
        opts = {};
      }
      _.extend(this, Backbone.Events);
      this.args = _.extend(opts, {
        customizer: this
      });
      this.rander();
      this.mainView;
    }

    Customizer.prototype.rander = function() {
      if (this.mainView !== void 0) {
        this.mainView.destroy();
      }
      return this.mainView = new CustomizerView(this.args);
    };

    return Customizer;

  })();

  window.Customizer = Customizer;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Customizer;
  } else {
    window.Customizer = Customizer;
  }

}).call(this);

(function() {
  Customizer.registerField('image', {
    view: "",
    edit: "<%= Customizer.templates[\"edit/color-picker\"]({rf : rf}) %>\n<%= Customizer.templates[\"edit/text-alignment\"]({rf : rf}) %>\n<%= Customizer.templates[\"edit/text-style\"]({rf : rf}) %>\n<% if(Customizer.options.settings.administration == true){ %>\n<%= Customizer.templates[\"edit/administration\"]({rf : rf}) %>\n<% } %>"
  });

}).call(this);

(function() {
  Customizer.registerField('text', {
    view: "",
    edit: "<%= Customizer.templates[\"edit/color-picker\"]({rf : rf}) %>\n<%= Customizer.templates[\"edit/text-alignment\"]({rf : rf}) %>\n<%= Customizer.templates[\"edit/text-style\"]({rf : rf}) %>\n<% if(Customizer.options.settings.administration == true){ %>\n <%= Customizer.templates[\"edit/administration\"]({rf : rf}) %>\n<% } %>"
  });

}).call(this);

this["Customizer"] = this["Customizer"] || {};
this["Customizer"]["templates"] = this["Customizer"]["templates"] || {};

this["Customizer"]["templates"]["edit/administration"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class=\'pc-administration-wrapper pull-right\'>\r\n    <div class="pc-style-icon admin-settings toggle-div" data-target="#admin-setting-container" ><i class="fa fa-gear"></i></span></div>\r\n</div>\r\n<div id="admin-setting-container" class="tool-tip" style="display:none">\r\n  <div class="tool-tip-container-inner">\r\n    ' +
((__t = ( Customizer.templates['edit/settings']({rf : rf}) )) == null ? '' : __t) +
'\r\n </div>\r\n</div>\r\n';

}
return __p
};

this["Customizer"]["templates"]["edit/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = ( Customizer.templates['edit/header']() )) == null ? '' : __t) +
'\n';
 if(Customizer.fields[rf.get(Customizer.options.mappings.OBJECT)] !== undefined){ ;
__p += '\n  ' +
((__t = ( Customizer.fields[rf.get(Customizer.options.mappings.OBJECT)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';
 } ;
__p += '\n' +
((__t = ( Customizer.templates['edit/footer']() )) == null ? '' : __t);

}
return __p
};

this["Customizer"]["templates"]["edit/color-picker"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'pc-color-wrapper\'>\r\n  ';
 if(rf.get(Customizer.options.mappings.LAYER_DATA+'.type') == 'text'){
    color = rf.get(Customizer.options.mappings.LAYER_DATA+'.fill')
  }else{
    if(rf.get(Customizer.options.mappings.LAYER_DATA+'.filters') !== undefined && rf.get(Customizer.options.mappings.LAYER_DATA+'.filters').length > 0){
      color = rf.get(Customizer.options.mappings.LAYER_DATA+'.filters')[0].color
    }else{
      color = ""
    }
  };
__p += '\r\n    <div class="colorselector"><div class="background-color" style="background-color:' +
((__t = ( color )) == null ? '' : __t) +
'"></div></div>\r\n</div>';

}
return __p
};

this["Customizer"]["templates"]["edit/footer"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '';

}
return __p
};

this["Customizer"]["templates"]["edit/header"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '';

}
return __p
};

this["Customizer"]["templates"]["edit/settings"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class=\'pc-settings-wrapper\'>\r\n\r\n <ul class=\'fb-tabs\'>\r\n      <li class=\'active\'><a data-target=\'#element-bounding-panel\'>Bounding Box</a></li>\r\n     <li><a data-target=\'#modifications-panel\'>Modifications</a></li>\r\n      <li><a data-target=\'#other-settings-panel\'>Other</a></li>\r\n   </ul>\r\n\r\n   <div class=\'fb-tab-content\'>\r\n      <div id="element-bounding-panel" class="fb-tab-pane active">\r\n\r\n      <div class="pc-input-container input-checkbox">\r\n       <label class="input-label" for="enable_bounding">Enable bounding box</label>\r\n        <div class="input-fields checkbox"> \r\n          <input type="checkbox" class="toggle-div" data-target="#pc-define-bounding" id="enable_bounding" name="enable_bounding" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingEnable") == true ? 'checked' : '' )) == null ? '' : __t) +
'>\r\n        </div>\r\n      </div>\r\n      <div id="pc-define-bounding" class="pc-define-bounding"  ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingEnable") == true ? '' : 'style="display:none"' )) == null ? '' : __t) +
'>\r\n\r\n        <div class="pc-input-container input-checkbox">\r\n         <label class="input-label" for="another_element_bounding">Use another element as bounding box</label>\r\n         <div class="input-fields checkbox"> \r\n            <input type="checkbox" class="toggle-div" data-target=".pc-define-bounding-name, .pc-define-bounding-coords" id="another_element_bounding" name="another_element_bounding" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".elementBoundingEnable") == true ? 'checked' : '' )) == null ? '' : __t) +
'>\r\n          </div>\r\n        </div>\r\n\r\n        \r\n        <div class="pc-define-bounding-name" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".elementBoundingEnable") == true ? '' : 'style="display:none"' )) == null ? '' : __t) +
'>\r\n\r\n          <div class="pc-input-container pc-full-width">\r\n            <label class="input-label">Define Bounding Box</label>\r\n            <div class="input-fields text"> \r\n              <input class="input_another_element_bounding_name" type="text" name="another_element_bounding_name" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingElementName") )) == null ? '' : __t) +
'">\r\n           </div>\r\n            <div class="description">Name when you have entered while adding<!-- or id of the layer (I.e. "c1", "c2", "c3", ...) -->.</div>\r\n         </div>\r\n        </div>\r\n        <div class="pc-define-bounding-coords" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".elementBoundingEnable") == true ? 'style="display:none"' : '' )) == null ? '' : __t) +
'>\r\n          <div class="pc-input-container pc-full-width">\r\n            <label class="input-label">Define Bounding Box Coords</label>\r\n           <div class="input-fields text"> \r\n              <div class="pc-input-container pc-half-width">\r\n                <label class="input-label">Left</label>\r\n               <input class="bounding_coords" data-coord="Left"  type="text" name="bounding_coords_x" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingCoordsLeft") )) == null ? '' : __t) +
'">\r\n             </div>\r\n              <div class="pc-input-container pc-half-width">\r\n                <label class="input-label">Top</label>\r\n                <input class="bounding_coords" data-coord="Top" type="text" name="bounding_coords_y" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingCoordsTop") )) == null ? '' : __t) +
'">\r\n             </div>\r\n            </div>\r\n\r\n            <div class="input-fields text"> \r\n              <div class="pc-input-container pc-half-width">\r\n                <label class="input-label">Width</label>\r\n                <input class="bounding_coords" data-coord="Width" type="text" name="bounding_coords_width" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingCoordsWidth") )) == null ? '' : __t) +
'">\r\n             </div>\r\n              <div class="pc-input-container pc-half-width">\r\n                <label class="input-label">Height</label>\r\n               <input class="bounding_coords" data-coord="Height" type="text" name="bounding_coords_height" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingCoordsHeight") )) == null ? '' : __t) +
'">\r\n             </div>\r\n            </div>\r\n            \r\n          </div>\r\n        </div>\r\n\r\n\r\n        <div class="pc-input-container pc-full-width">\r\n          <label class="input-label">Mode</label> \r\n          <div class="input-fields select">\r\n           <select class="input_bounding_box_mode" name="bounding_box_mode">\r\n             <option value="inside" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingMode") == 'inside' ? 'selected' : '' )) == null ? '' : __t) +
'>Inside</option>\r\n             <option value="clipping" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".boundingMode") == 'clipping' ? 'selected' : '' )) == null ? '' : __t) +
'>Clipping</option>\r\n           </select>\r\n         </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n\r\n    <div id="modifications-panel" class="fb-tab-pane">\r\n      <div class="checkbox-group">\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"><input class="checkbox-draggable" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".isDraggable") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Draggable</label>\r\n        </div>\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"><input class="checkbox-rotatable" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".lockRotation") == false ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Rotatable</label>\r\n\r\n        </div>\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"><input class="checkbox-resizable" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".isResizable") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Resizable</label>\r\n        </div>\r\n\r\n        <div class="pc-input-container pc-half-width">\r\n          <label class="input-label"><input class="checkbox-hide-layer" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".hideLayer") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Hide Layer</label>\r\n       </div>\r\n\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"><input class="checkbox-removable" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".removable") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Removable</label>\r\n        </div>\r\n\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"><input class="checkbox-unlockable" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".unlockable") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Unlockable</label>\r\n       </div>\r\n        <div class="pc-input-container  pc-half-width">\r\n         <label class="input-label"> <input class="checkbox-stay-on-top" ' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".stayOnTop") == true ? 'checked' : '' )) == null ? '' : __t) +
' type="checkbox"> Stay On Top</label>\r\n        </div> \r\n     </div>\r\n    </div>\r\n\r\n\r\n    <div id="other-settings-panel" class="fb-tab-pane">\r\n     <div class="pc-input-container pc-full-width">\r\n        <label class="input-label">Allowed Colors</label>\r\n       <div class="input-fields text"> \r\n          <input class="pc_allowed_colors" type="text" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".allowedColors") )) == null ? '' : __t) +
'">\r\n       </div>\r\n        <div class="description">Add hexadecimal code of the color. For add multiple colors used comma(,).</div>\r\n      </div>\r\n      <div class="pc-input-container pc-full-width">\r\n        <label class="input-label">Default color</label>\r\n        <div class="input-fields text"> \r\n          <input class="pc_default_color" type="text" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".defaultColor") )) == null ? '' : __t) +
'">\r\n       </div>\r\n        <div class="description">Add hexadecimal code of the color. I.e. "#000000, #FFF"</div>\r\n      </div>\r\n    </div>\r\n    </div>\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n  \r\n\r\n  \r\n\r\n\r\n\r\n    <!-- <div class="pc-style-icon bring-forward"></div> -->\r\n     \r\n</div>';

}
return __p
};

this["Customizer"]["templates"]["edit/text-alignment"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class=\'pc-alignment-wrapper left-border\'>\r\n    <div class="pc-style-icon align-top"><span class="mif-vertical-align-top"></span></div>\r\n   <div class="pc-style-icon align-right"><span class="mif-vertical-align-top rotate90"></span></div>\r\n    <div class="pc-style-icon align-bottom"><span class="mif-vertical-align-bottom"></span></div>\r\n   <div class="pc-style-icon align-left"><span class="mif-vertical-align-bottom rotate90"></span></div>\r\n\r\n    <div class="pc-style-icon vertical-align-center"><span class="mif-vertical-align-center"></span></div>\r\n    <div class="pc-style-icon hoizontal-align-center"><span class="mif-vertical-align-center rotate90"></span></div>\r\n</div>';

}
return __p
};

this["Customizer"]["templates"]["edit/text-style"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'pc-style-wrapper left-border\'>\r\n  ';
 if(rf.get(Customizer.options.mappings.LAYER_DATA+".type") == 'text'){ ;
__p += '\r\n    <div class="pc-style-icon font-familty toggle-div" data-target="#font-family"><i class="fa fa-font" aria-hidden="true"></i></div>\r\n   <div class="pc-style-icon text-bold"><span class="mif-bold"></span></div>\r\n   <div class="pc-style-icon text-italic"><span class="mif-italic"></span></div>\r\n   <div class="pc-style-icon text-underline"><span class="mif-underline"></span></div>\r\n   ';
 } ;
__p += '\r\n    <div class="pc-style-icon rotate-left"><i class="fa fa-rotate-left"></i></div>\r\n    <div class="pc-style-icon rotate-right"><i class="fa fa-rotate-right"></i></div>  \r\n</div>\r\n\r\n';
 fonts = []
jQuery.each(Customizer.fonts, function(index,font){
  if(rf.get(Customizer.options.mappings.LAYER_DATA+".fontFamily") == font.name){ 
    selected = "selected='selected'";
  }else{
    selected = "";
  }
  fonts.push("<option value='"+font.name+"' "+selected+" style='font-family:\""+font.name+"\"'>"+font.displayName+"</option>");
}); ;
__p += '\r\n<div id="font-family" class="tool-tip" style="display: none;">\r\n  <div class="tool-tip-container-inner">\r\n    <div class="tool-tip-title">Font</div>\r\n    <div class="tool-tip-wraper">\r\n     <div class="font-familty-wraper">\r\n       <div class="pc-input-container pc-full-width">\r\n          <label class="input-label">Select Font Familty</label>\r\n          <div class="input-fields select">\r\n           <select class="text-font-family">\r\n             ' +
((__t = ( fonts.join("") )) == null ? '' : __t) +
'\r\n           </select>\r\n         </div>\r\n          \r\n        </div>\r\n\r\n        <div class="pc-input-container pc-full-width">\r\n          <label class="input-label">Font Size</label>\r\n          <div class="input-fields select">\r\n           <input type="number" class="text-font-size" value="' +
((__t = ( rf.get(Customizer.options.mappings.LAYER_DATA+".fontSize") )) == null ? '' : __t) +
'" class="text-font-family">\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>';

}
return __p
};

this["Customizer"]["templates"]["page"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '\n<div class=\'fb-left\'>\n <div class=\'pc-assets\'>\n   <ul class=\'fb-tabs\'>\n      <li class=\'active\'><a data-target=\'#pc-backgrounds-panel\'><span class="mif-images"></span> Images</a></li>\n      <li><a data-target=\'#pc-text-panel\'><i class="fa fa-file-text"></i> Text</a></li>\n     <li><a data-target=\'#pc-upload-image-panel\'><span class="fa fa fa-upload"></span> Upload</a></li>\n   </ul>\n\n   <div class=\'fb-tab-content\'>\n      ' +
((__t = ( Customizer.templates['partials/panels/images']() )) == null ? '' : __t) +
'\n     ' +
((__t = ( Customizer.templates['partials/panels/text']() )) == null ? '' : __t) +
'\n     ' +
((__t = ( Customizer.templates['partials/panels/upload-image']() )) == null ? '' : __t) +
'\n   </div>\n  </div>\n</div>\n<div class=\'fb-right\'>\n  ' +
((__t = ( Customizer.templates['partials/canvas']() )) == null ? '' : __t) +
'\n\n ' +
((__t = ( Customizer.templates['partials/edit']() )) == null ? '' : __t) +
'\n</div>\n' +
((__t = ( Customizer.templates['partials/layers']() )) == null ? '' : __t) +
'\n<div class=\'fb-clear\'></div>\n\n<div class=\'fb-save-wrapper\'>\n  <button class=\'js-save-data ' +
((__t = ( Customizer.options.BUTTON_CLASS )) == null ? '' : __t) +
'\'></button>\n</div>\n<div class="pc-loader-container">\n  <div class="pc-loading-inner">\n    <div class="pc-loading-icon"><!-- <span class="mif-spinner2 mif-ani-spin"></span> --><span class="mif-spinner3 mif-ani-spin"></span></div>\n    <div class="pc-loading-text">Loading...</div>\n </div>\n</div>';

}
return __p
};

this["Customizer"]["templates"]["partials/add_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane active\' id=\'addField\'>\n  <div class=\'fb-add-field-types\'>\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Customizer.inputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Customizer.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Customizer.nonInputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Customizer.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n  </div>\n</div>\n';

}
return __p
};

this["Customizer"]["templates"]["partials/canvas"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="pc-canvas-waraper">\n<div class="pc-title canvas-actions">\n  <div class="pc-icon-inline download" data-title="Download PDF file"><span class="mif-file-pdf"></span></div>\n  <div class="pc-icon-inline preview" data-title="Preview"><span class="mif-eye"></span></div>\n  <div class="pc-icon-inline-seprater"></div>\n <div class="pc-icon-inline zoom-in" data-title="Zoom-in"><span class="mif-zoom-in"></span></div>\n  <div class="pc-icon-inline zoom-out" data-title="Zoom-out"><span class="mif-zoom-out"></span></div>\n <div class="pc-icon-inline zoom-reset" data-title="Reset zoom"><span class="mif-search"></span></div>\n <div class="pc-icon-inline-seprater" ></div>\n  <div class="pc-icon-inline fullscreen pull-right" data-title="Fullscreen"><span class="mif-enlarge"></span></div>\n</div>\n<div class=\'pc-canvas\'></div>\n</div>\n';

}
return __p
};

this["Customizer"]["templates"]["partials/edit"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div id="pc-edit-layer" class=\'draggable pc-edit-layer\'></div>\n';

}
return __p
};

this["Customizer"]["templates"]["partials/layers"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div id="pc-layers" class=\'draggable pc-layersbar\'>\n \n</div>\n';

}
return __p
};

this["Customizer"]["templates"]["partials/panels/images"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane active\' id=\'pc-backgrounds-panel\'>\n  <div class=\'fb-add-field-types\'>\n    <div class=\'section\'>\n       ';
 _.each(Customizer.images, function(category){ ;
__p += '\n          ';
 _.each(_.sortBy(category, 'order'), function(f){ ;
__p += '\n            <a data-field-id="' +
((__t = ( f.id )) == null ? '' : __t) +
'" data-field-type="' +
((__t = ( f.type )) == null ? '' : __t) +
'" class="' +
((__t = ( f.type )) == null ? '' : __t) +
'-image assets">\n          ';
 if(f.addButton === undefined || f.addButton === null || f.addButton === ""){ ;
__p += '\n                  ';
 if(f.thumb === undefined || f.thumb === null || f.thumb === ""){ ;
__p += '\n                      <img src="' +
((__t = ( f.full )) == null ? '' : __t) +
'">\n                 ';
 }else{ ;
__p += '\n                      <img src="' +
((__t = ( f.thumb )) == null ? '' : __t) +
'">\n                 ';
 } ;
__p += '\n              ';
 }else{ ;
__p += '\n                  ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n             ';
 } ;
__p += '\n          </a>\n\n          ';
 }); ;
__p += '\n        ';
 }); ;
__p += '\n    </div>\n  </div>\n</div>\n';

}
return __p
};

this["Customizer"]["templates"]["partials/panels/text"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'pc-text-panel\'>\n  <div class=\'fb-text-field-wrapper\'>\n   <div class="input-field-container">\n     <label>Text</label>\n     <textarea class="pc-text" placeholder="Please enter text"></textarea>\n </div>\n  <div class="input-field-container">\n   <input type="button" class="add-text fb-button pull-right" value="Add">\n </div>\n  </div>\n</div>';

}
return __p
};

this["Customizer"]["templates"]["partials/panels/upload-image"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'pc-upload-image-panel\'>\n  <div class=\'fb-upload-image-field-wrapper\'>\n   <div class="input-field-container">\n     <label>Upload Image</label>\n     <div class="pd-upload-zone">\n        <div class="inner-upload-zone">\n            <span class="fa fa fa-upload"></span>\n         <span data-defaulttext="Click or drop images here">Click or drop images here</span>\n          </div>\n        <input type="file" class="pc-upload-image">\n     </div>\n  </div>\n  <div class="uploaded-image-container">\n    <ul></ul>\n </div>\n  </div>\n</div>';

}
return __p
};

this["Customizer"]["templates"]["partials/text-fonts-css"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style type="text/css">\r\n    ';
 
    jQuery.each(Customizer.fonts, function(index,font){
        var font_str = [];
        jQuery.each(font.src, function(type, path){
            switch(type){
                case 'eot':
                 format = "format('embedded-opentype')";
                 url = "#iefix";
                 break;
                case 'woff':
                 format = "format('woff')";
                 url = "";
                 break;
                case 'ttf':
                 format = "format('truetype')";
                 url = "";
                 break;
                case 'svg':
                 format = "format('svg')";
                 url = "#"+font.name;
                 break;
            }
            font_str.push("url('"+path+"') "+format);
        }); 
        ;
__p += '\r\n        @font-face{\r\n            font-family:\'' +
((__t = ( font.name )) == null ? '' : __t) +
'\';    \r\n            ' +
((__t = ( (font_str.length > 0) ? 'src:'+font_str.join(', ')+";" : "" )) == null ? '' : __t) +
'\r\n            font-weight:normal;\r\n            font-style:normal;\r\n        }\r\n    ';
 }); ;
__p += '\r\n</style>\r\n</style>';

}
return __p
};

this["Customizer"]["templates"]["view/edit"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '';

}
return __p
};

this["Customizer"]["templates"]["view/layers"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="pc-container">\n  <div class=\'pc-title handle\'><span class="mif-stack"></span> Layers</div>\n   <div class=\'pc-body\'>\n     <ul class="pc-layers-contianer">\n        ';
 if(layers.length > 0){
          _.each(_.sortBy(layers, 'order').reverse(), function(_layer){
            ;
__p += '\n          ';
 layer = _layer.toJSON(Customizer.options.jsonArgs) ;
__p += '\n        ';
 active = _layer.canvas.getActiveObject() ;
__p += '\n          <li \n            style="' +
((__t = ( (Customizer.options.settings.administration == false && _layer.hideLayer) || (_layer.displayInLayerBar !== undefined && _layer.displayInLayerBar == false) ? 'display:none' : "" )) == null ? '' : __t) +
'" \n           class="layers ' +
((__t = ( (active !== undefined && active !== null && active.id == _layer.id) ? 'active' : '' )) == null ? '' : __t) +
' ' +
((__t = ( (Customizer.options.settings.administration == false && (_layer.hideLayer == true || _layer.unlockable == false || _layer.removable == false)) ? 'unsortable' : '' )) == null ? '' : __t) +
'" \n           data-id="' +
((__t = ( _layer.id )) == null ? '' : __t) +
'">\n           <span class="pc-image-contianer">\n             ';
 if(layer.type == 'text'){ ;
__p += '\n                <i class="fa fa-text-width"></i>\n              ';
 }else{ ;
__p += '\n                <img width=50  src="' +
((__t = ( layer.src )) == null ? '' : __t) +
'">\n             ';
 } ;
__p += '\n            </span>\n           <span class="pc-layer-title">\n             ';
 if(_layer.title !== undefined && _layer.title !== null ){ ;
__p += '\n                ' +
((__t = ( _layer.id )) == null ? '' : __t) +
' - ' +
((__t = ( _layer.title )) == null ? '' : __t) +
'\n             ';
 }else{ ;
__p += '\n                ';
 if(layer.type == 'text'){ ;
__p += '\n                  ' +
((__t = ( _layer.id )) == null ? '' : __t) +
' - ' +
((__t = ( layer.text.substring(0,15) )) == null ? '' : __t) +
'\n               ';
 }else{ ;
__p += '\n                ' +
((__t = ( _layer.id )) == null ? '' : __t) +
' - ' +
((__t = ( layer.type )) == null ? '' : __t) +
'\n               ';
 } ;
__p += '\n            ';
 };
__p += '\n            </span>\n         <span class="pc-layers-action">\n           ';
 if(Customizer.options.settings.administration == true || layer.removable == true){;
__p += '\n                <a href="javascript:" class="pc-layers-delete"><i class="fa fa-trash-o fa-1"> </i></a>\n              ';
 } ;
__p += '\n              ';
 if(Customizer.options.settings.administration == true || layer.unlockable == true){;
__p += '\n              <a href="javascript:" class="pc-layers-lock-unlock"><i class="fa ' +
((__t = ( _layer.locked == true ? 'fa-lock' : 'fa-unlock-alt' )) == null ? '' : __t) +
'"></i></a>\n           ';
 } ;
__p += '\n            </span>\n         </li>\n         ';
 }); ;
__p += '\n\n        ';
 }else{ ;
__p += '\n        <li class="layers no-found">No layer found.</li>\n        ';
 } ;
__p += '\n      </ul>\n   </div>\n</div>';

}
return __p
};

this["Customizer"]["templates"]["view/popup"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="pc-modal">\n  <div class="model-inner">\n   <div class="modal-heder pc-title">\n      ';
 if(modal.title){ ;
__p += '\n      <div class="pc-title-text">' +
((__t = ( modal.title )) == null ? '' : __t) +
'</div>\n     ';
 } ;
__p += '\n      <div class="pc-model-close"><a href="javascript:" class="close"><span class="mif-cross"></span></a></div>\n   </div>\n    <div class="pc-model-body">\n     ' +
((__t = ( modal.body )) == null ? '' : __t) +
'\n   </div>\n  </div>\n</div>';

}
return __p
};